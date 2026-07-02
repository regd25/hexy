"""
HarnessRuntime mínimo (F4) — el loop `act → observe → validate → decide → repeat`.

Cierra el "hueco del loop" (docs/hexy/harness-runtime.md): toma un `Process` modelado y lo
CORRE en vez de solo modelarlo. Etapas del contrato SOL→Hexy que cubre:

  PLAN   Process.relaciones → Step[] · Policy conectadas → Guardrail[] ·
         Intent conectado → goal · Evaluation conectada → criterio de término.
  RUN    por cada Step: ACT (acción simulada — F5 traerá tools MCP), OBSERVE
         (observation con el resultado), VALIDATE (guardrails deterministas sobre la
         observación), DECIDE (violation fatal → parada; presupuesto agotado → parada;
         si no, siguiente step). Cada transición emite un evento de traza.

La traza sigue el vocabulario de shared/types/ExecutionContext.ts (events / observations /
violations) y se emite como generador → streaming SSE por el endpoint /run.

Guardrails deterministas (el agente no puede "convencerlos"):
  - Policy con "prohibido <término>" / "prohibit <término>" → si una observación contiene
    el término ⇒ Violation severity=error (el loop PARA).
  - Policy con "requiere <término>" / "require <término>" → si al final ninguna observación
    lo contiene ⇒ Violation severity=warning (queda en la traza, no detiene).
"""

from __future__ import annotations

import re
import time


from mcp_client import McpClient, McpError

DEFAULT_BUDGET = 20

_PROHIBIT_RE = re.compile(r"\b(?:prohibido|prohibida|prohibit)\s+([\wáéíóúñÁÉÍÓÚÑ-]+)", re.IGNORECASE)
_REQUIRE_RE = re.compile(r"\b(?:requiere|require)\s+([\wáéíóúñÁÉÍÓÚÑ-]+)", re.IGNORECASE)

# Directiva de tool en la descripción de un step: `tool: nombre {"arg": "valor"}` (F5).
_TOOL_RE = re.compile(r"tool:\s*([\w-]+)\s*(\{.*\})?", re.IGNORECASE | re.DOTALL)

_NEGATION_RE = re.compile(r"\b(?:no|sin|nunca|not|never|non)\b", re.IGNORECASE)


def _grants_destructive(text):
    """
    True si el texto de la Authority autoriza acciones destructivas de forma AFIRMATIVA.
    Una mención negada («no destructivas», «sin acciones destructivas») no concede el permiso.
    """
    lowered = (text or "").lower()
    for m in re.finditer(r"destructiv", lowered):
        window = lowered[max(0, m.start() - 45) : m.start()]
        if _NEGATION_RE.search(window):
            continue  # mención negada: no es un grant
        return True
    return False


def _parse_tool_directive(artifact):
    """Extrae la directiva `tool:` de la descripción del step, si existe."""
    m = _TOOL_RE.search(artifact.get("description", "") or "")
    if not m:
        return None
    args = {}
    if m.group(2):
        try:
            import json as _json

            args = _json.loads(m.group(2))
        except ValueError:
            args = {"_raw": m.group(2)}
    return {"name": m.group(1), "args": args}


class PlanError(ValueError):
    """El Process no puede planificarse (sin steps, o no es un process)."""


def _neighbors(process_id, relationships):
    """Ids conectados al proceso (cualquier dirección), con el tipo de arista."""
    out = []
    for r in relationships:
        if r["sourceId"] == process_id:
            out.append((r["targetId"], r["type"], "out"))
        elif r["targetId"] == process_id:
            out.append((r["sourceId"], r["type"], "in"))
    return out


def build_plan(model, process_id, budget=DEFAULT_BUDGET):
    """
    Etapa PLAN del contrato: deriva steps, guardrails, goal y término del grafo.
    Falla explícitamente (PlanError) si el Process no existe o no tiene flow.
    """
    artifacts = {a["id"]: a for a in model.get("artifacts", []) or []}
    relationships = model.get("relationships", []) or []

    process = artifacts.get(process_id)
    if not process:
        raise PlanError(f"Process {process_id} no existe en el modelo")
    if process.get("type") != "process":
        raise PlanError(f"El artefacto '{process.get('name', process_id)}' no es un Process")

    neighbors = [(artifacts[nid], rel_type, direction) for nid, rel_type, direction in _neighbors(process_id, relationships) if nid in artifacts]

    # Steps: artefactos salientes del proceso que no son policy/intent/evaluation
    # (esos gobiernan el loop, no son acciones). Si su descripción trae una directiva
    # `tool: nombre {args}` el step es una tool call MCP real (F5); si no, simulado.
    steps = [
        {**a, "tool": _parse_tool_directive(a)}
        for a, _rel, direction in neighbors
        if direction == "out" and a["type"] not in ("policy", "intent", "evaluation", "authority")
    ]
    if not steps:
        raise PlanError(f"Process '{process['name']}' sin flow: no tiene steps (relaciones salientes ejecutables)")

    # Goal: primer Intent conectado (el "qué"); término: primera Evaluation conectada (el "cómo se reconoce el éxito").
    goal = next((a for a, _r, _d in neighbors if a["type"] == "intent"), None)
    evaluation = next((a for a, _r, _d in neighbors if a["type"] == "evaluation"), None)

    # Guardrails: Policies conectadas al proceso → términos prohibidos/requeridos.
    prohibited, required = [], []
    for a, _rel, _direction in neighbors:
        if a["type"] != "policy":
            continue
        text = f"{a.get('name', '')} {a.get('description', '')}"
        for m in _PROHIBIT_RE.finditer(text):
            prohibited.append({"term": m.group(1).lower(), "policy": a})
        for m in _REQUIRE_RE.finditer(text):
            required.append({"term": m.group(1).lower(), "policy": a})

    # Authority → permisos de tools (PEP/PDP determinista, F5):
    #   readOnly     siempre permitido;
    #   write        requiere CUALQUIER Authority conectada al proceso;
    #   destructive  requiere una Authority cuyo texto autorice lo destructivo.
    authorities = [a for a, _r, _d in neighbors if a["type"] == "authority"]
    grants = {
        "write": next((a["name"] for a in authorities), None),
        "destructive": next(
            (a["name"] for a in authorities if _grants_destructive(f"{a.get('name', '')} {a.get('description', '')}")),
            None,
        ),
    }

    return {
        "process": process,
        "goal": goal,
        "evaluation": evaluation,
        "steps": steps,
        "prohibited": prohibited,
        "required": required,
        "grants": grants,
        "budget": max(1, int(budget or DEFAULT_BUDGET)),
    }


def run_process(model, process_id, budget=DEFAULT_BUDGET):
    """
    Corre el loop y va emitiendo la traza (generador de dicts serializables).
    Tipos de entrada de traza: event | observation | violation | done.
    """
    seq = 0

    def entry(kind, **data):
        nonlocal seq
        seq += 1
        return {"seq": seq, "kind": kind, "ts": time.time(), **data}

    try:
        plan = build_plan(model, process_id, budget)
    except PlanError as e:
        yield entry("violation", severity="error", stage="plan", message=str(e))
        yield entry("done", status="planFailed")
        return

    process, steps = plan["process"], plan["steps"]
    yield entry(
        "event",
        name="loop:start",
        process=process["name"],
        goal=plan["goal"]["name"] if plan["goal"] else None,
        termination=plan["evaluation"]["name"] if plan["evaluation"] else f"completar {len(steps)} step(s)",
        steps=[s["name"] for s in steps],
        tools=[f"{s['name']} → {s['tool']['name']}" for s in steps if s.get("tool")],
        guardrails={"prohibit": [g["term"] for g in plan["prohibited"]], "require": [g["term"] for g in plan["required"]]},
        budget=plan["budget"],
    )

    # Sesión MCP perezosa: solo se abre si algún step declara una tool (F5).
    mcp = None
    tool_index = {}

    def ensure_mcp():
        nonlocal mcp, tool_index
        if mcp is None:
            mcp = McpClient().start()
            tool_index = mcp.tools_list()
        return tool_index

    observations = []
    try:
        for i, step in enumerate(steps):
            # DECIDE (presupuesto): tope duro como ciudadano de primera clase.
            if i >= plan["budget"]:
                yield entry("event", name="loop:decide", decision="budgetExhausted", step=i + 1)
                yield entry("done", status="budgetExhausted", completedSteps=i, totalSteps=len(steps))
                return

            tool = step.get("tool")
            if tool:
                # ACT real vía MCP: resolver annotations → autorizar (Authority) → llamar.
                try:
                    index = ensure_mcp()
                except McpError as e:
                    yield entry("violation", severity="error", stage="act", step=i + 1, message=str(e))
                    yield entry("done", status="toolFailed", completedSteps=i, totalSteps=len(steps))
                    return

                spec = index.get(tool["name"])
                if not spec:
                    yield entry("violation", severity="error", stage="act", step=i + 1, message=f"Tool desconocida en el servidor MCP: «{tool['name']}»")
                    yield entry("done", status="toolFailed", completedSteps=i, totalSteps=len(steps))
                    return

                ann = spec.get("annotations", {}) or {}
                level = "readOnly" if ann.get("readOnlyHint") else "destructive" if ann.get("destructiveHint") else "write"

                # AUTHORIZE (PEP/PDP): el guardrail de Authority decide por nivel.
                grants = plan["grants"]
                if level == "readOnly":
                    allowed, reason = True, "readOnly: no requiere Authority"
                elif level == "destructive":
                    allowed = grants["destructive"] is not None
                    reason = (
                        f"Authority '{grants['destructive']}' autoriza acciones destructivas"
                        if allowed
                        else "requiere una Authority conectada que autorice acciones destructivas"
                    )
                else:
                    allowed = grants["write"] is not None
                    reason = (
                        f"Authority '{grants['write']}' autoriza escritura"
                        if allowed
                        else "requiere una Authority conectada al proceso"
                    )
                yield entry("event", name="tool:authorize", step=i + 1, tool=tool["name"], level=level, allowed=allowed, reason=reason)

                if not allowed:
                    yield entry(
                        "violation",
                        severity="error",
                        stage="authorize",
                        step=i + 1,
                        message=f"Step '{step['name']}' bloqueado: tool «{tool['name']}» ({level}) — {reason}",
                    )
                    yield entry("event", name="loop:decide", decision="stopOnViolation", step=i + 1)
                    yield entry("done", status="stoppedByViolation", completedSteps=i, totalSteps=len(steps))
                    return

                yield entry("event", name="tool:call", step=i + 1, tool=tool["name"], args=tool["args"], level=level)
                try:
                    result_text, is_error = mcp.tools_call(tool["name"], tool["args"])
                except McpError as e:
                    yield entry("violation", severity="error", stage="act", step=i + 1, message=str(e))
                    yield entry("done", status="toolFailed", completedSteps=i, totalSteps=len(steps))
                    return
                if is_error:
                    yield entry("violation", severity="error", stage="act", step=i + 1, message=f"Tool «{tool['name']}» devolvió error: {result_text}")
                    yield entry("done", status="toolFailed", completedSteps=i, totalSteps=len(steps))
                    return
                obs_text = result_text or f"Tool {tool['name']} ejecutada sin salida"
                obs_source = tool["name"]
            else:
                # ACT simulado/local (steps sin tool).
                yield entry("event", name="step:act", step=i + 1, actor=step["type"], action=step["name"])
                obs_text = f"Ejecutado: {step['name']} — {step.get('description', '')}".strip(" —")
                obs_source = step["name"]

            # OBSERVE — resultado de la acción → observation en la traza.
            observations.append(obs_text)
            yield entry("observation", step=i + 1, source=obs_source, content=obs_text)

            # VALIDATE — guardrails deterministas sobre la observación (también aplica
            # a resultados de tools: una tool que devuelva un término prohibido para el loop).
            fatal = None
            for g in plan["prohibited"]:
                if g["term"] in obs_text.lower():
                    fatal = entry(
                        "violation",
                        severity="error",
                        stage="validate",
                        step=i + 1,
                        policy=g["policy"]["name"],
                        message=f"Policy '{g['policy']['name']}' incumplida: la observación contiene el término prohibido «{g['term']}»",
                    )
                    break

            # DECIDE — violation fatal = parada; si no, siguiente step.
            if fatal:
                yield fatal
                yield entry("event", name="loop:decide", decision="stopOnViolation", step=i + 1)
                yield entry("done", status="stoppedByViolation", completedSteps=i, totalSteps=len(steps))
                return
            yield entry("event", name="loop:decide", decision="continue", step=i + 1)
    finally:
        if mcp:
            mcp.close()

    # Fin de steps: chequear requisitos (Policy require) sobre toda la traza.
    all_obs = " ".join(observations).lower()
    for g in plan["required"]:
        if g["term"] not in all_obs:
            yield entry(
                "violation",
                severity="warning",
                stage="validate",
                policy=g["policy"]["name"],
                message=f"Policy '{g['policy']['name']}': el término requerido «{g['term']}» no aparece en ninguna observación",
            )

    # Término: Evaluation satisfecha (todos los steps completados sin violation fatal).
    yield entry(
        "event",
        name="evaluation:satisfied",
        evaluation=plan["evaluation"]["name"] if plan["evaluation"] else None,
        message=f"{len(steps)} step(s) completados sin violaciones fatales",
    )
    yield entry("done", status="completed", completedSteps=len(steps), totalSteps=len(steps))
