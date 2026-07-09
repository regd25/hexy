"""
Context Orchestration (F6) — «semántica como compresión».

Materializa el diferenciador de Hexy: en cada decisión del loop, en vez de volcar el
modelo entero al contexto de la acción, se selecciona SOLO el sub-grafo de artefactos
relevante al step y se recorta a un presupuesto de tokens. Cada pieza incluida viaja con
su justificación (por qué entró) y el bundle reporta cuánto se comprimió respecto del
modelo completo.

Selección por cercanía semántica en el grafo al step (BFS sobre el modelo `{artifacts,
relationships}` como grafo NO dirigido) + un boost para los artefactos que *gobiernan* el
proceso (Policy / Authority / Intent / Evaluation) y para el Process contenedor. El
resultado se ordena por relevancia y se llena hasta agotar `max_tokens`; el propio step
siempre entra (es el ancla, nunca se descarta).

Estimación de tokens: ~len(texto)/4 (heurística estándar), sobre `name + description`.
Es una pieza PURA y testeable, sin dependencias pesadas — misma línea que projector.py /
runtime.py.
"""

from __future__ import annotations

from collections import deque

DEFAULT_CONTEXT_TOKENS = 120

# Artefactos que gobiernan el loop (no son acciones): entran con prioridad porque su
# semántica condiciona la decisión del step (guardrails, permisos, objetivo, término).
_GOVERNANCE_BOOST = {
    "policy": 0.6,
    "authority": 0.6,
    "intent": 0.5,
    "evaluation": 0.5,
    "process": 0.4,
}

_TYPE_REASON = {
    "policy": "Policy que gobierna el proceso (guardrail)",
    "authority": "Authority que autoriza el proceso",
    "intent": "Intent — objetivo del proceso",
    "evaluation": "Evaluation — criterio de término",
    "process": "Process contenedor del step",
}


def estimate_tokens(artifact):
    """Estimación barata de tokens de un artefacto (~len(texto)/4 sobre name+description)."""
    text = f"{artifact.get('name', '')} {artifact.get('description', '')}".strip()
    return max(1, len(text) // 4)


def _adjacency(relationships):
    """Grafo NO dirigido id → [(vecino, tipo_arista)]."""
    adj = {}
    for r in relationships:
        a, b, t = r["sourceId"], r["targetId"], r.get("type", "references")
        adj.setdefault(a, []).append((b, t))
        adj.setdefault(b, []).append((a, t))
    return adj


def _bfs(step_id, adj):
    """Distancia (en saltos) y arista de entrada de cada id alcanzable desde el step."""
    dist = {step_id: 0}
    via = {step_id: None}  # (vecino_predecesor, tipo_arista)
    q = deque([step_id])
    while q:
        node = q.popleft()
        for neighbor, edge in adj.get(node, []):
            if neighbor not in dist:
                dist[neighbor] = dist[node] + 1
                via[neighbor] = (node, edge)
                q.append(neighbor)
    return dist, via


def _reason(artifact, artifacts, dist, via):
    """Justificación en lenguaje natural de por qué el artefacto entró al contexto."""
    aid = artifact["id"]
    if dist[aid] == 0:
        return "step en ejecución (ancla del contexto)"
    typed = _TYPE_REASON.get(artifact.get("type"))
    if typed:
        return typed
    pred_id, edge = via[aid]
    pred = artifacts.get(pred_id, {})
    hops = dist[aid]
    salto = "salto" if hops == 1 else "saltos"
    return f"vecino a {hops} {salto} vía «{pred.get('name', pred_id)}» ({edge})"


def _score(artifact, dist):
    """Relevancia: cercanía al step + boost si gobierna el proceso."""
    proximity = 1.0 / (1 + dist[artifact["id"]])
    boost = _GOVERNANCE_BOOST.get(artifact.get("type"), 0.0)
    return proximity + boost


def select_context(model, step_id, max_tokens=DEFAULT_CONTEXT_TOKENS):
    """
    Selecciona el sub-grafo de artefactos relevante a `step_id`, recortado a `max_tokens`.

    Devuelve un `ContextBundle` (dict serializable):
      { step_id, step_name,
        included: [{id, name, type, reason, tokens, distance, score}],
        excluded_count, tokens_used, tokens_budget, compression_ratio }

    Garantías (verificadas por tests):
      - included ⊆ artefactos del modelo (nunca inventa piezas).
      - tokens_used ≤ max_tokens salvo que el propio step ya lo exceda (el ancla no se
        descarta jamás).
      - las `reason` referencian artefactos reales del modelo.
    """
    artifacts = {a["id"]: a for a in model.get("artifacts", []) or []}
    relationships = model.get("relationships", []) or []
    budget = max(1, int(max_tokens or DEFAULT_CONTEXT_TOKENS))

    if step_id not in artifacts:
        raise KeyError(f"step {step_id} no existe en el modelo")

    total_tokens = sum(estimate_tokens(a) for a in artifacts.values()) or 1

    adj = _adjacency(relationships)
    dist, via = _bfs(step_id, adj)

    # Candidatos: artefactos alcanzables desde el step (mismo componente del grafo).
    reachable = [artifacts[i] for i in dist if i in artifacts]
    # Orden: relevancia desc; a igualdad, más cercano; a igualdad, id estable.
    reachable.sort(key=lambda a: (-_score(a, dist), dist[a["id"]], a["id"]))

    included = []
    tokens_used = 0
    for artifact in reachable:
        tok = estimate_tokens(artifact)
        is_anchor = artifact["id"] == step_id
        # El ancla entra siempre; el resto solo si cabe en el presupuesto.
        if not is_anchor and tokens_used + tok > budget:
            continue
        tokens_used += tok
        included.append(
            {
                "id": artifact["id"],
                "name": artifact.get("name", artifact["id"]),
                "type": artifact.get("type", "artifact"),
                "reason": _reason(artifact, artifacts, dist, via),
                "tokens": tok,
                "distance": dist[artifact["id"]],
                "score": round(_score(artifact, dist), 3),
            }
        )

    included_ids = {p["id"] for p in included}
    return {
        "step_id": step_id,
        "step_name": artifacts[step_id].get("name", step_id),
        "included": included,
        "excluded_count": len(artifacts) - len(included_ids),
        "tokens_used": tokens_used,
        "tokens_budget": budget,
        # Fracción del modelo completo (en tokens) que realmente se cargó: < 1 ⇒ hubo
        # compresión semántica (se dejó fuera parte del modelo).
        "compression_ratio": round(tokens_used / total_tokens, 4),
    }
