"""
Proyección a RDF + inferencias semánticas (la "capa pesada" de Hexy).

Toma el modelo autorado (artefactos + relaciones declaradas) y calcula lo que la capa
ligera (Node/dashboard) no puede:
  - proyección a un grafo RDF (rdflib) con un namespace hexy:,
  - cierre transitivo de relaciones transitivas (depends_on, contains) → relaciones
    INFERIDAS que no estaban declaradas,
  - detección de ciclos (smell semántico),
  - estadísticas del grafo (raíces, hojas, grados, conteo de triples).

Lógica pura y testeable (sin FastAPI). Spec: docs/hexy/implementation/F3-engine-bridge.md
"""

from __future__ import annotations

import networkx as nx
from rdflib import Graph, Literal, Namespace, RDF, RDFS

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
        g = nx.DiGraph()
        g.add_nodes_from(a["id"] for a in artifacts)
        declared = {(r["sourceId"], r["targetId"]) for r in relationships if r["type"] == rel_type}
        g.add_edges_from(declared)
        if g.number_of_edges() == 0:
            continue
        closure = nx.transitive_closure(g, reflexive=False)
        for u, v in closure.edges():
            if (u, v) not in declared:
                inferred.append({"sourceId": u, "targetId": v, "type": rel_type, "via": "transitive"})
        for cycle in nx.simple_cycles(g):
            cycles.append({"type": rel_type, "nodes": cycle})
    return inferred, cycles


def project(model):
    """
    Entrada: {artifacts:[{id,type,name,description}], relationships:[{sourceId,targetId,type}]}
    Salida:  {entities, declared, inferred, cycles, stats, rdf:{triples, turtle}}
    """
    artifacts = _norm_artifacts(model)
    valid_ids = {a["id"] for a in artifacts}
    relationships = _norm_relationships(model, valid_ids)

    graph, turtle = build_rdf(artifacts, relationships)
    inferred, cycles = _infer_transitive(artifacts, relationships)

    # Grados sobre el grafo completo de relaciones declaradas.
    dg = nx.DiGraph()
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
        "stats": {
            "nodes": len(artifacts),
            "edges": len(relationships),
            "triples": len(graph),
            "byType": by_type,
            "roots": roots,
            "leaves": leaves,
            "inferredCount": len(inferred),
            "cycleCount": len(cycles),
        },
        "rdf": {"triples": len(graph), "turtle": turtle},
    }
