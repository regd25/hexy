"""
Proyección a RDF + inferencias semánticas (la "capa pesada" de Hexy).

Toma el modelo autorado (artefactos + relaciones declaradas) y calcula lo que la capa
ligera (Node/dashboard) no puede:
  - proyección a un grafo RDF (rdf.py propio) con un namespace hexy:,
  - cierre transitivo de relaciones transitivas (depends_on, contains) → relaciones
    INFERIDAS que no estaban declaradas,
  - detección de ciclos (smell semántico),
  - estadísticas del grafo (raíces, hojas, grados, conteo de triples).

Lógica pura y testeable (sin FastAPI). Spec: docs/hexy/implementation/F3-engine-bridge.md
"""

from __future__ import annotations

import graphs
from rdf import Graph, Literal, Namespace, RDF, RDFS

HEXY = Namespace("https://hexy.dev/onto#")

# Relaciones con semántica transitiva: si A→B y B→C, entonces A→C.
TRANSITIVE_TYPES = ("depends_on", "contains")


def _norm_artifacts(model):
    out = []
    for a in model.get("artifacts", []) or []:
        if not a.get("id"):
            continue
        out.append(
            {
                "id": str(a["id"]),
                "type": str(a.get("type", "artifact")),
                "name": a.get("name", ""),
                "description": a.get("description", ""),
            }
        )
    return out


def _norm_relationships(model, valid_ids):
    out = []
    for r in model.get("relationships", []) or []:
        s, t = r.get("sourceId"), r.get("targetId")
        if not s or not t or s not in valid_ids or t not in valid_ids:
            continue
        out.append({"sourceId": str(s), "targetId": str(t), "type": str(r.get("type", "references"))})
    return out


def build_rdf(artifacts, relationships):
    """Proyecta el modelo a un grafo RDF y devuelve (grafo, turtle)."""
    g = Graph()
    g.bind("hexy", HEXY)
    for a in artifacts:
        node = HEXY[a["id"]]
        g.add((node, RDF.type, HEXY[a["type"].capitalize()]))
        if a["name"]:
            g.add((node, RDFS.label, Literal(a["name"])))
    for r in relationships:
        g.add((HEXY[r["sourceId"]], HEXY[r["type"]], HEXY[r["targetId"]]))
    return g, g.serialize(format="turtle")


def _infer_transitive(artifacts, relationships):
    """Cierre transitivo por tipo: devuelve relaciones inferidas (no declaradas) y ciclos."""
    inferred = []
    cycles = []
    for rel_type in TRANSITIVE_TYPES:
        g = graphs.DiGraph()
        g.add_nodes_from(a["id"] for a in artifacts)
        declared = {(r["sourceId"], r["targetId"]) for r in relationships if r["type"] == rel_type}
        g.add_edges_from(declared)
        if g.number_of_edges() == 0:
            continue
        closure = graphs.transitive_closure(g)
        for u, v in closure.edges():
            if (u, v) not in declared:
                inferred.append({"sourceId": u, "targetId": v, "type": rel_type, "via": "transitive"})
        for cycle in graphs.simple_cycles(g):
            cycles.append({"type": rel_type, "nodes": cycle})
    return inferred, cycles


def _diagnose(artifacts, relationships, cycles):
    """
    Diagnósticos estructurales accionables sobre el modelo (severity/code/artifactId/message).
    No describe el grafo (eso son las stats): señala qué está mal y cómo corregirlo.
    """
    diagnostics = []
    connected = set()
    for r in relationships:
        connected.add(r["sourceId"])
        connected.add(r["targetId"])

    # Vecinos por artefacto (para chequeos de gobernanza) y tipos por id.
    type_of = {a["id"]: a["type"] for a in artifacts}
    neighbor_types = {a["id"]: set() for a in artifacts}
    for r in relationships:
        neighbor_types[r["sourceId"]].add(type_of.get(r["targetId"], ""))
        neighbor_types[r["targetId"]].add(type_of.get(r["sourceId"], ""))
    out_ids = {r["sourceId"] for r in relationships}

    for a in artifacts:
        aid, atype, name = a["id"], a["type"], a["name"] or a["id"]

        # Huérfano: no participa en ninguna relación.
        if aid not in connected:
            diagnostics.append({
                "severity": "warning", "code": "ORPHAN_ARTIFACT", "artifactId": aid,
                "message": f"El artefacto '{name}' ({atype}) no está conectado a nada. Conéctalo o elimínalo.",
            })
            continue

        # Process sin flow: no tiene relaciones salientes ejecutables (mismo criterio que el runtime).
        if atype == "process" and aid not in out_ids:
            diagnostics.append({
                "severity": "error", "code": "PROCESS_WITHOUT_FLOW", "artifactId": aid,
                "message": f"El Process '{name}' no tiene steps (relaciones salientes). No se puede ejecutar.",
            })

        # Intent sin Evaluation: no hay forma de reconocer el éxito.
        if atype == "intent" and "evaluation" not in neighbor_types[aid]:
            diagnostics.append({
                "severity": "warning", "code": "INTENT_WITHOUT_EVALUATION", "artifactId": aid,
                "message": f"El Intent '{name}' no tiene una Evaluation conectada: no hay criterio de término.",
            })

        # Policy/Authority desconectada de cualquier Process: no gobierna nada.
        if atype in ("policy", "authority") and "process" not in neighbor_types[aid]:
            diagnostics.append({
                "severity": "warning", "code": "GOVERNANCE_NOT_APPLIED", "artifactId": aid,
                "message": f"La {atype.capitalize()} '{name}' no está conectada a ningún Process: no gobierna ninguna ejecución.",
            })

    # Ciclos: smell semántico fatal para relaciones transitivas.
    for c in cycles:
        diagnostics.append({
            "severity": "error", "code": "CYCLE", "artifactId": c["nodes"][0] if c["nodes"] else None,
            "message": f"Ciclo en relaciones '{c['type']}': {' → '.join(c['nodes'])}. Rompe la dependencia circular.",
        })

    return diagnostics


def project(model):
    """
    Entrada: {artifacts:[{id,type,name,description}], relationships:[{sourceId,targetId,type}]}
    Salida:  {entities, declared, inferred, cycles, diagnostics, stats, rdf:{triples, turtle}}
    """
    artifacts = _norm_artifacts(model)
    valid_ids = {a["id"] for a in artifacts}
    relationships = _norm_relationships(model, valid_ids)

    graph, turtle = build_rdf(artifacts, relationships)
    inferred, cycles = _infer_transitive(artifacts, relationships)
    diagnostics = _diagnose(artifacts, relationships, cycles)

    # Grados sobre el grafo completo de relaciones declaradas.
    dg = graphs.DiGraph()
    dg.add_nodes_from(valid_ids)
    dg.add_edges_from((r["sourceId"], r["targetId"]) for r in relationships)
    roots = sorted(n for n in dg.nodes if dg.in_degree(n) == 0 and dg.out_degree(n) > 0)
    leaves = sorted(n for n in dg.nodes if dg.out_degree(n) == 0 and dg.in_degree(n) > 0)

    by_type = {}
    for a in artifacts:
        by_type[a["type"]] = by_type.get(a["type"], 0) + 1

    return {
        "entities": artifacts,
        "declared": relationships,
        "inferred": inferred,
        "cycles": cycles,
        "diagnostics": diagnostics,
        "stats": {
            "nodes": len(artifacts),
            "edges": len(relationships),
            "triples": len(graph),
            "byType": by_type,
            "roots": roots,
            "leaves": leaves,
            "inferredCount": len(inferred),
            "cycleCount": len(cycles),
            "diagnosticCount": len(diagnostics),
            "errorCount": sum(1 for d in diagnostics if d["severity"] == "error"),
            "warningCount": sum(1 for d in diagnostics if d["severity"] == "warning"),
        },
        "rdf": {"triples": len(graph), "turtle": turtle},
    }
