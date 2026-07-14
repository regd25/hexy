"""
Servicio HTTP del motor Hexy (capa pesada) — stdlib pura, sin dependencias.
Expone la proyección RDF + inferencias del modelo y el HarnessRuntime (SSE).
Corre como proceso aparte; el backend Node (server/) hace de proxy.

Arranque (desde core/engine/):  python3 app.py
"""

from __future__ import annotations

import json
import os
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from projector import project
from runtime import run_process, DEFAULT_BUDGET
from context import DEFAULT_CONTEXT_TOKENS
from enricher import enrich_model
from extractor import extract_repo

HOST = "127.0.0.1"
PORT = 8000
VERSION = "0.1.0"

# El dashboard (3000) y el backend (4000) consumen el motor.
ALLOWED_ORIGINS = {"http://localhost:3000", "http://localhost:4000"}


class EngineHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = f"HexyEngine/{VERSION}"

    # --- helpers ---
    def _cors_headers(self):
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""
        if not raw:
            return {}
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as err:
            raise ValueError(f"JSON inválido: {err}") from err
        if not isinstance(data, dict):
            raise ValueError("se esperaba un objeto JSON")
        return data

    @staticmethod
    def _model_from(body):
        return {
            "artifacts": body.get("artifacts") or [],
            "relationships": body.get("relationships") or [],
        }

    # --- rutas ---
    def do_OPTIONS(self):  # noqa: N802 (nombre requerido por BaseHTTPRequestHandler)
        self.send_response(204)
        self._cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):  # noqa: N802
        if self.path == "/health":
            self._send_json(200, {"status": "ok", "engine": "hexy", "version": VERSION})
        else:
            self._send_json(404, {"error": f"ruta no encontrada: {self.path}"})

    def do_POST(self):  # noqa: N802
        try:
            body = self._read_body()
        except ValueError as err:
            self._send_json(400, {"error": str(err)})
            return

        try:
            if self.path == "/model/project":
                self._send_json(200, project(self._model_from(body)))
                return

            if self.path == "/repo/extract":
                path = body.get("path")
                if not path or not os.path.isdir(path):
                    self._send_json(400, {"error": f"path inválido o no es un directorio: {path!r}", "code": "BAD_PATH"})
                    return
                options = {
                    k: body[k]
                    for k in ("languages", "granularity", "adapters", "exclude", "maxFiles", "maxDepth")
                    if body.get(k) is not None
                }
                self._send_json(200, extract_repo(path, options))
                return

            if self.path == "/model/enrich":
                # Fase C: Gemini etiqueta el grafo estructural (nombre/descripción/tipo + relaciones
                # semánticas), con clamp anti-alucinación. `path` opcional = repo para extractos.
                path = body.get("path")
                root = path if path and os.path.isdir(path) else None
                self._send_json(200, enrich_model(self._model_from(body), root, {"model": body.get("model")}))
                return

            if self.path in ("/run", "/run/sync"):
                process_id = body.get("processId")
                if not process_id:
                    self._send_json(400, {"error": "processId es requerido"})
                    return
                budget = int(body.get("budget") or DEFAULT_BUDGET)
                tokens = int(body.get("contextTokens") or DEFAULT_CONTEXT_TOKENS)
                trace = run_process(self._model_from(body), process_id, budget, tokens)
                if self.path == "/run/sync":
                    self._send_json(200, {"trace": list(trace)})
                else:
                    self._stream_sse(trace)
                return
        except Exception as err:  # noqa: BLE001 — el motor NO debe fallar en silencio (500 mudo)
            self._send_json(500, {
                "error": f"{type(err).__name__}: {err}",
                "code": "ENGINE_ERROR",
                "path": self.path,
                "traceback": traceback.format_exc(),
            })
            return

        self._send_json(404, {"error": f"ruta no encontrada: {self.path}"})

    def _stream_sse(self, items):
        """Emite la traza como Server-Sent Events: `data: {json}\n\n` por entrada."""
        self.send_response(200)
        self._cors_headers()
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Accel-Buffering", "no")
        # Sin Content-Length: el fin del stream lo marca el cierre de la conexión.
        self.send_header("Connection", "close")
        self.end_headers()
        def emit(item):
            chunk = f"data: {json.dumps(item, ensure_ascii=False)}\n\n"
            self.wfile.write(chunk.encode("utf-8"))
            self.wfile.flush()

        try:
            for item in items:
                emit(item)
        except (BrokenPipeError, ConnectionResetError):
            pass  # el cliente cortó; nada que hacer
        except Exception as err:  # noqa: BLE001 — reportar el fallo en la traza, no colgar el stream
            try:
                emit({"kind": "violation", "severity": "error", "stage": "engine",
                      "message": f"{type(err).__name__}: {err}", "traceback": traceback.format_exc()})
                emit({"kind": "done", "status": "engineError"})
            except (BrokenPipeError, ConnectionResetError):
                pass

    def log_message(self, fmt, *args):  # silencia el log por request del BaseHTTPRequestHandler
        pass


def main():
    server = ThreadingHTTPServer((HOST, PORT), EngineHandler)
    print(f"[engine] Hexy engine (stdlib) escuchando en http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[engine] cerrando…")
        server.shutdown()


if __name__ == "__main__":
    main()
