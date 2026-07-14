"""
Enriquecedor semántico (Fase C) — Gemini etiqueta el grafo estructural con la ontología.

Contrato B → C: la Fase B (extractor) produce el grafo ESTRUCTURAL verificado (ids estables,
referencia al código en cada description). Esta fase le pide a un LLM (Gemini) que lo ETIQUETE:
nombre de negocio, descripción real anclada a la referencia, tipo ontológico y relaciones
semánticas — SOLO sobre nodos existentes. El LLM no puede inventar nodos: `clamp_enrichment`
descarta cualquier id desconocido, tipo fuera de la ontología o relación inválida
(anti-alucinación determinista, mismo espíritu que el PEP/PDP de tools en F5).

Stdlib puro (urllib): la clave se lee de GEMINI_API_KEY (env o .env.local/.env junto a este
archivo). Modelo configurable vía GEMINI_MODEL (default gemini-2.5-flash).
"""

from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request

from extractor.core import sol_name

# Ontología SOL (espejo de server/src/domain/constants.js — mantener sincronizado).
ARTIFACT_TYPES = (
    "intent", "context", "authority", "evaluation", "vision", "policy", "principle",
    "guideline", "concept", "indicator", "process", "procedure", "event", "result",
    "observation", "actor", "area",
)
RELATION_TYPES = (
    "depends_on", "implements", "influences", "contains", "references", "supports",
    "conflicts_with", "evolves_to", "validates", "derives_from",
)

_SOL_NAME_RE = re.compile(r"^[A-Z][a-zA-Z0-9]*$")

DEFAULT_MODEL = "gemini-2.5-flash"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

# Presupuestos del prompt (chars, no tokens — estimación conservadora).
MAX_SNIPPET_CHARS = 1200
MAX_TOTAL_SNIPPET_CHARS = 60_000
MAX_SNIPPET_FILES = 60


def load_env(dirpath):
    """Lee .env.local y .env (en ese orden) de un directorio; el entorno del proceso gana."""
    values = {}
    for fname in (".env", ".env.local"):
        path = os.path.join(dirpath, fname)
        if not os.path.isfile(path):
            continue
        with open(path, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                values[k.strip()] = v.strip().strip('"').strip("'")
    values.update({k: v for k, v in os.environ.items() if k.startswith("GEMINI_")})
    return values


def collect_snippets(model, root):
    """
    Extractos de código para anclar las descripciones: la description de cada nodo estructural
    es su referencia (ruta relativa). Archivos → primeras líneas; carpetas → listado de nombres.
    """
    snippets = []
    total = 0
    if not root or not os.path.isdir(root):
        return snippets
    for a in model.get("artifacts", []) or []:
        if len(snippets) >= MAX_SNIPPET_FILES or total >= MAX_TOTAL_SNIPPET_CHARS:
            break
        ref = (a.get("description") or "").strip()
        # En descripciones de adaptadores la ruta va al final («… — ruta»).
        if " — " in ref:
            ref = ref.rsplit(" — ", 1)[-1].strip()
        if not ref or ref.startswith("/") or ".." in ref:
            continue
        path = os.path.join(root, ref)
        if os.path.isfile(path):
            try:
                with open(path, encoding="utf-8", errors="replace") as f:
                    text = f.read(MAX_SNIPPET_CHARS)
            except OSError:
                continue
            snippets.append({"id": a["id"], "ref": ref, "excerpt": text})
            total += len(text)
        elif os.path.isdir(path):
            try:
                names = sorted(os.listdir(path))[:15]
            except OSError:
                continue
            listing = ", ".join(names)
            snippets.append({"id": a["id"], "ref": ref, "excerpt": f"(carpeta) contiene: {listing}"})
            total += len(listing)
    return snippets


def build_prompt(model, snippets, repo_name=""):
    """Prompt compacto: grafo + extractos + contrato JSON estricto."""
    nodes = [
        {"id": a["id"], "name": a.get("name", ""), "type": a.get("type", ""), "ref": a.get("description", "")}
        for a in model.get("artifacts", []) or []
    ]
    edges = [
        {"s": r["sourceId"], "t": r["targetId"], "type": r.get("type", "")}
        for r in model.get("relationships", []) or []
    ]
    return f"""Eres el motor semántico de Hexy, un framework de modelado organizacional (ontología SOL).
Recibes el grafo ESTRUCTURAL extraído automáticamente del repo «{repo_name}». Tu tarea es ETIQUETARLO
semánticamente, en español, SIN inventar nada que el código no evidencie.

Para CADA nodo devuelve:
- "name": nombre de negocio en PascalCase estricto (^[A-Z][a-zA-Z0-9]*$), significativo para la organización
  (p.ej. MovimientosInventario, no InventoryMovements si el dominio es hispano; conserva el actual si ya es bueno).
- "description": 1-2 frases REALES sobre qué es/hace en el sistema, ancladas en la evidencia. Termina SIEMPRE
  con " — ref: <ref del nodo>" (la referencia dada, sin modificarla).
- "type": el tipo ontológico que mejor describe su ROL organizacional, uno de: {", ".join(ARTIFACT_TYPES)}.
  Guía: entidad de datos → concept · flujo/módulo que hace algo → process o procedure · quien actúa → actor ·
  agrupación → area · regla → policy · métrica → indicator. Si dudas, conserva el actual.

Además propone relaciones SEMÁNTICAS nuevas (las estructurales ya existen) SOLO entre ids listados,
con tipo en: implements, validates, influences, supports, derives_from, conflicts_with.
Propón pocas y defendibles (máximo ~20), nada especulativo.

REGLAS DURAS: usa únicamente ids de NODOS; no inventes nodos ni referencias; si no hay evidencia
suficiente para un nodo, conserva su name/type actuales y describe solo lo verificable.

Responde SOLO con JSON válido con esta forma exacta:
{{"updates": [{{"id": "...", "name": "...", "description": "...", "type": "..."}}],
  "relationships": [{{"sourceId": "...", "targetId": "...", "type": "..."}}]}}

NODOS ({len(nodes)}):
{json.dumps(nodes, ensure_ascii=False)}

ARISTAS ESTRUCTURALES ({len(edges)}):
{json.dumps(edges, ensure_ascii=False)}

EXTRACTOS DE CÓDIGO (evidencia):
{json.dumps(snippets, ensure_ascii=False)}
"""


def call_gemini(prompt, api_key, model_name=DEFAULT_MODEL, timeout=240):
    """Llama a generateContent forzando salida JSON. Devuelve el texto de la respuesta."""
    url = GEMINI_URL.format(model=model_name) + f"?key={api_key}"
    # responseSchema: obliga a Gemini a emitir TODOS los campos (sin él omite `type`).
    schema = {
        "type": "OBJECT",
        "properties": {
            "updates": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "id": {"type": "STRING"},
                        "name": {"type": "STRING"},
                        "description": {"type": "STRING"},
                        "type": {"type": "STRING", "enum": list(ARTIFACT_TYPES)},
                    },
                    "required": ["id", "name", "description", "type"],
                },
            },
            "relationships": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "sourceId": {"type": "STRING"},
                        "targetId": {"type": "STRING"},
                        "type": {"type": "STRING", "enum": list(RELATION_TYPES)},
                    },
                    "required": ["sourceId", "targetId", "type"],
                },
            },
        },
        "required": ["updates", "relationships"],
    }
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
            "temperature": 0.2,
        },
    }
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            data = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:400]
        raise RuntimeError(f"Gemini HTTP {e.code}: {body}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Gemini inaccesible: {e.reason}") from e
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"Respuesta de Gemini sin contenido: {json.dumps(data)[:400]}") from e


def clamp_enrichment(raw, model):
    """
    Valida y recorta la propuesta del LLM contra el grafo real (anti-alucinación determinista):
      - updates solo para ids existentes; name debe cumplir la convención SOL (si no, se conserva
        el actual); type debe estar en la ontología; la referencia original se preserva en la
        description (se anexa si el LLM la omitió).
      - relaciones solo entre ids existentes, tipo válido, sin self-loops ni duplicados
        (contra las declaradas y entre propuestas).
    Devuelve {"updates", "relationships", "skipped": [razones]} — skipped es trazabilidad, no error.
    """
    artifacts = {a["id"]: a for a in model.get("artifacts", []) or []}
    declared = {
        (r["sourceId"], r["targetId"], r.get("type"))
        for r in model.get("relationships", []) or []
    }
    skipped = []

    updates = []
    for u in raw.get("updates", []) or []:
        aid = u.get("id")
        current = artifacts.get(aid)
        if not current:
            skipped.append(f"update para id inexistente: {aid!r}")
            continue
        # Normaliza a la convención SOL (Reseñas → Resenas); si aún así no cumple, conserva.
        name = sol_name((u.get("name") or "").strip())
        if name == "Unnamed" or not _SOL_NAME_RE.match(name):
            skipped.append(f"{aid}: nombre fuera de convención {u.get('name')!r} → se conserva «{current.get('name')}»")
            name = current.get("name", "")
        atype = (u.get("type") or "").strip().lower()
        if not atype:
            atype = current.get("type", "concept")  # omitido = conservar (sin ruido en skipped)
        elif atype not in ARTIFACT_TYPES:
            skipped.append(f"{aid}: tipo fuera de ontología {atype!r} → se conserva «{current.get('type')}»")
            atype = current.get("type", "concept")
        ref = (current.get("description") or "").strip()
        description = (u.get("description") or "").strip() or ref
        if ref and ref not in description:
            description = f"{description} — ref: {ref}"
        updates.append({"id": aid, "name": name, "description": description, "type": atype})

    relationships = []
    seen = set()
    for r in raw.get("relationships", []) or []:
        s, t = r.get("sourceId"), r.get("targetId")
        rtype = (r.get("type") or "").strip().lower()
        if s not in artifacts or t not in artifacts:
            skipped.append(f"relación con id inexistente: {s!r} → {t!r}")
            continue
        if rtype not in RELATION_TYPES:
            skipped.append(f"relación con tipo inválido: {rtype!r} ({s} → {t})")
            continue
        if s == t:
            skipped.append(f"self-loop descartado: {s}")
            continue
        key = (s, t, rtype)
        if key in declared or key in seen:
            continue  # ya existe o duplicada en la propuesta
        seen.add(key)
        relationships.append({"sourceId": s, "targetId": t, "type": rtype})

    return {"updates": updates, "relationships": relationships, "skipped": skipped}


def enrich_model(model, root=None, options=None):
    """
    Orquesta la Fase C: snippets → prompt → Gemini → clamp. Devuelve la propuesta validada
    (el que la APLICA es el backend Node, dueño de la persistencia).
    """
    opts = options or {}
    env = load_env(os.path.dirname(os.path.abspath(__file__)))
    api_key = env.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY no configurada (env o core/engine/.env.local)")
    model_name = opts.get("model") or env.get("GEMINI_MODEL") or DEFAULT_MODEL

    snippets = collect_snippets(model, root)
    repo_name = os.path.basename(os.path.abspath(root)) if root else ""
    prompt = build_prompt(model, snippets, repo_name)
    text = call_gemini(prompt, api_key, model_name)
    try:
        raw = json.loads(text)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Gemini no devolvió JSON válido: {text[:300]}") from e

    result = clamp_enrichment(raw, model)
    result["stats"] = {
        "model": model_name,
        "snippets": len(snippets),
        "updates": len(result["updates"]),
        "newRelationships": len(result["relationships"]),
        "skipped": len(result["skipped"]),
    }
    return result
