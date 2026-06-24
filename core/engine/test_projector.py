"""Tests del proyector (F3): cierre transitivo, ciclos, proyección RDF y stats."""

from projector import project


def _model():
    return {
        "artifacts": [
            {"id": "a", "type": "intent", "name": "Claridad"},
            {"id": "b", "type": "process", "name": "Proceso"},
            {"id": "c", "type": "policy", "name": "Politica"},
        ],
        "relationships": [
            {"sourceId": "b", "targetId": "a", "type": "depends_on"},
            {"sourceId": "c", "targetId": "b", "type": "depends_on"},
        ],
    }


def test_infers_transitive_dependency():
    result = project(_model())
    # c → b → a, así que se infiere c → a (no declarada).
    inferred = {(r["sourceId"], r["targetId"], r["type"]) for r in result["inferred"]}
    assert ("c", "a", "depends_on") in inferred
    assert result["stats"]["inferredCount"] >= 1


def test_no_false_inference_for_declared_edges():
    result = project(_model())
    inferred = {(r["sourceId"], r["targetId"]) for r in result["inferred"]}
    # Las aristas declaradas no se reportan como inferidas.
    assert ("b", "a") not in inferred
    assert ("c", "b") not in inferred


def test_detects_cycles():
    model = {
        "artifacts": [{"id": "x", "type": "intent"}, {"id": "y", "type": "process"}],
        "relationships": [
            {"sourceId": "x", "targetId": "y", "type": "depends_on"},
            {"sourceId": "y", "targetId": "x", "type": "depends_on"},
        ],
    }
    result = project(model)
    assert result["stats"]["cycleCount"] >= 1


def test_projects_rdf_triples_and_stats():
    result = project(_model())
    assert result["stats"]["nodes"] == 3
    assert result["stats"]["edges"] == 2
    assert result["rdf"]["triples"] > 0
    assert "hexy" in result["rdf"]["turtle"]
    # 'a' es hoja (sin salientes) y 'c' es raíz (sin entrantes).
    assert "a" in result["stats"]["leaves"]
    assert "c" in result["stats"]["roots"]


def test_ignores_relationships_with_unknown_endpoints():
    model = {
        "artifacts": [{"id": "a", "type": "intent"}],
        "relationships": [{"sourceId": "a", "targetId": "ghost", "type": "depends_on"}],
    }
    result = project(model)
    assert result["stats"]["edges"] == 0
