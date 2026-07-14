"""Tests del proyector (F3): cierre transitivo, ciclos, proyección RDF y stats."""

import unittest

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


class TestProjector(unittest.TestCase):
    def test_infers_transitive_dependency(self):
        result = project(_model())
        # c → b → a, así que se infiere c → a (no declarada).
        inferred = {(r["sourceId"], r["targetId"], r["type"]) for r in result["inferred"]}
        self.assertIn(("c", "a", "depends_on"), inferred)
        self.assertGreaterEqual(result["stats"]["inferredCount"], 1)

    def test_no_false_inference_for_declared_edges(self):
        result = project(_model())
        inferred = {(r["sourceId"], r["targetId"]) for r in result["inferred"]}
        # Las aristas declaradas no se reportan como inferidas.
        self.assertNotIn(("b", "a"), inferred)
        self.assertNotIn(("c", "b"), inferred)

    def test_detects_cycles(self):
        model = {
            "artifacts": [{"id": "x", "type": "intent"}, {"id": "y", "type": "process"}],
            "relationships": [
                {"sourceId": "x", "targetId": "y", "type": "depends_on"},
                {"sourceId": "y", "targetId": "x", "type": "depends_on"},
            ],
        }
        result = project(model)
        self.assertGreaterEqual(result["stats"]["cycleCount"], 1)

    def test_projects_rdf_triples_and_stats(self):
        result = project(_model())
        self.assertEqual(result["stats"]["nodes"], 3)
        self.assertEqual(result["stats"]["edges"], 2)
        self.assertGreater(result["rdf"]["triples"], 0)
        self.assertIn("hexy", result["rdf"]["turtle"])
        # 'a' es hoja (sin salientes) y 'c' es raíz (sin entrantes).
        self.assertIn("a", result["stats"]["leaves"])
        self.assertIn("c", result["stats"]["roots"])

    def test_ignores_relationships_with_unknown_endpoints(self):
        model = {
            "artifacts": [{"id": "a", "type": "intent"}],
            "relationships": [{"sourceId": "a", "targetId": "ghost", "type": "depends_on"}],
        }
        result = project(model)
        self.assertEqual(result["stats"]["edges"], 0)

    def _codes(self, result):
        return {(d["code"], d["artifactId"]) for d in result["diagnostics"]}

    def test_diagnostic_process_without_flow(self):
        # Un Process sin relaciones salientes no se puede ejecutar → error.
        model = {
            "artifacts": [{"id": "p", "type": "process", "name": "P"}, {"id": "i", "type": "intent"}],
            "relationships": [{"sourceId": "i", "targetId": "p", "type": "references"}],
        }
        result = project(model)
        self.assertIn(("PROCESS_WITHOUT_FLOW", "p"), self._codes(result))
        self.assertGreaterEqual(result["stats"]["errorCount"], 1)

    def test_diagnostic_orphan_and_governance_and_intent(self):
        model = {
            "artifacts": [
                {"id": "p", "type": "process", "name": "P"},
                {"id": "s", "type": "action", "name": "Paso"},
                {"id": "pol", "type": "policy", "name": "Desconectada"},
                {"id": "orph", "type": "concept", "name": "Suelto"},
                {"id": "i", "type": "intent", "name": "Meta"},
            ],
            "relationships": [
                {"sourceId": "p", "targetId": "s", "type": "references"},
                {"sourceId": "i", "targetId": "p", "type": "references"},
                {"sourceId": "pol", "targetId": "i", "type": "references"},
            ],
        }
        codes = self._codes(project(model))
        self.assertIn(("ORPHAN_ARTIFACT", "orph"), codes)          # sin ninguna relación
        self.assertIn(("GOVERNANCE_NOT_APPLIED", "pol"), codes)    # conectada, pero no a un process
        self.assertIn(("INTENT_WITHOUT_EVALUATION", "i"), codes)   # intent sin evaluation
        self.assertNotIn(("PROCESS_WITHOUT_FLOW", "p"), codes)     # p sí tiene salida → sin error

    def test_clean_model_has_no_diagnostics(self):
        model = {
            "artifacts": [
                {"id": "p", "type": "process", "name": "P"},
                {"id": "s", "type": "action", "name": "Paso"},
                {"id": "i", "type": "intent", "name": "Meta"},
                {"id": "e", "type": "evaluation", "name": "Criterio"},
                {"id": "pol", "type": "policy", "name": "Regla"},
            ],
            "relationships": [
                {"sourceId": "p", "targetId": "s", "type": "references"},
                {"sourceId": "i", "targetId": "p", "type": "references"},
                {"sourceId": "e", "targetId": "i", "type": "references"},
                {"sourceId": "pol", "targetId": "p", "type": "references"},
            ],
        }
        result = project(model)
        self.assertEqual(result["diagnostics"], [])
        self.assertEqual(result["stats"]["diagnosticCount"], 0)


if __name__ == "__main__":
    unittest.main()
