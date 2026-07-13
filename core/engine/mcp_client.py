"""
Cliente MCP mínimo (F5) — stdlib puro, transporte stdio (JSON-RPC 2.0, un mensaje por línea).

Cubre el subconjunto que necesita el HarnessRuntime para ejecutar tools reales:
initialize → notifications/initialized → tools/list → tools/call. El servidor se lanza como
subproceso (HEXY_MCP_CMD; default: el servidor de prueba tools/mcp-notes del repo).

Las annotations de cada tool (readOnlyHint / destructiveHint / idempotentHint) alimentan el
guardrail de Authority en runtime.py (PEP/PDP): el cliente solo transporta, no decide.
"""

from __future__ import annotations

import json
import os
import queue
import shlex
import subprocess
import threading
from pathlib import Path

PROTOCOL_VERSION = "2025-03-26"
_REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MCP_CMD = f"node {_REPO_ROOT / 'tools' / 'mcp-notes' / 'server.js'}"


class McpError(RuntimeError):
    """Fallo de transporte o del servidor MCP."""


class McpClient:
    """Sesión MCP sobre stdio contra un servidor lanzado como subproceso."""

    def __init__(self, cmd: str | None = None, timeout: float = 10.0):
        self.cmd = cmd or os.environ.get("HEXY_MCP_CMD") or DEFAULT_MCP_CMD
        self.timeout = timeout
        self._proc: subprocess.Popen | None = None
        self._queue: queue.Queue = queue.Queue()
        self._seq = 0

    # --- ciclo de vida ---
    def start(self):
        try:
            self._proc = subprocess.Popen(
                shlex.split(self.cmd),
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                text=True,
                bufsize=1,
            )
        except OSError as e:
            raise McpError(f"No se pudo lanzar el servidor MCP «{self.cmd}»: {e}") from e

        threading.Thread(target=self._reader, daemon=True).start()

        result = self._request("initialize", {"protocolVersion": PROTOCOL_VERSION, "capabilities": {}, "clientInfo": {"name": "hexy-harness", "version": "0.1.0"}})
        self._notify("notifications/initialized")
        self.server_info = result.get("serverInfo", {})
        return self

    def close(self):
        if self._proc:
            try:
                self._proc.terminate()
            except OSError:
                pass
            self._proc = None

    def __enter__(self):
        return self.start()

    def __exit__(self, *_exc):
        self.close()

    # --- API MCP ---
    def tools_list(self):
        """Devuelve {nombre → tool} con sus annotations."""
        tools = self._request("tools/list", {}).get("tools", [])
        return {t["name"]: t for t in tools}

    def tools_call(self, name: str, arguments: dict | None = None):
        """Invoca la tool y devuelve (texto_resultado, is_error)."""
        result = self._request("tools/call", {"name": name, "arguments": arguments or {}})
        texts = [c.get("text", "") for c in result.get("content", []) if c.get("type") == "text"]
        return "\n".join(texts).strip(), bool(result.get("isError"))

    # --- transporte JSON-RPC/stdio ---
    def _reader(self):
        proc = self._proc
        if not proc or not proc.stdout:
            return
        for line in proc.stdout:
            line = line.strip()
            if not line:
                continue
            try:
                self._queue.put(json.loads(line))
            except json.JSONDecodeError:
                continue

    def _send(self, payload: dict):
        if not self._proc or not self._proc.stdin:
            raise McpError("Sesión MCP no iniciada")
        self._proc.stdin.write(json.dumps(payload, ensure_ascii=False) + "\n")
        self._proc.stdin.flush()

    def _notify(self, method: str, params: dict | None = None):
        self._send({"jsonrpc": "2.0", "method": method, **({"params": params} if params else {})})

    def _request(self, method: str, params: dict):
        self._seq += 1
        rid = self._seq
        self._send({"jsonrpc": "2.0", "id": rid, "method": method, "params": params})
        while True:
            try:
                msg = self._queue.get(timeout=self.timeout)
            except queue.Empty as e:
                raise McpError(f"Timeout esperando respuesta MCP a «{method}»") from e
            if msg.get("id") != rid:
                continue  # notificación u otra respuesta: se ignora
            if "error" in msg:
                raise McpError(f"MCP {method} → {msg['error'].get('message', 'error')}")
            return msg.get("result", {})
