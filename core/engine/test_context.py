"""Tests de Context Orchestration (F6): sub-grafo ⊆ modelo, respeta budget, reasons reales."""

import unittest

from context import select_context, estimate_tokens


def _big_model():
    """
    Un Process con varios steps, governance (policy/authority/intent/evaluation) y un
    artefacto lejano y desconectado que NUNCA debería entrar al contexto de un step.
    """
    artifacts = [
        {"id": "p", "type": "process", "name": "Onboarding", "description": "Proceso de alta de clientes."},
        {"id": "s1", "type": "procedure", "name": "Validar identidad", "description": "Verificar documentos del solicitante."},
        {"id": "s2", "type": "procedure", "name": "Crear cuenta", "description": "Alta en el sistema core."},
        {"id": "s3", "type": "procedure", "name": "Notificar", "description": "Enviar correo de bienvenida."},
        {"id": "i", "type": "intent", "name": "AltaConfiable", "description": "Altas confiables y auditables."},
        {"id": "e", "type": "evaluation", "name": "AltaCompleta", "description": "Cuenta creada y validada."},
        {"id": "pol", "type": "policy", "name": "SinBorrado", "description": "Queda prohibido eliminar registros de clientes."},
        {"id": "auth", "type": "authority", "name": "OpsLead", "description": "Autoriza la operación del alta."},
        # Artefacto de otro subsistema, sin ninguna relación con el proceso:
        {"id": "far", "type": "concept", "name": "Facturación", "description": "Dominio no relacionado con onboarding."},
    ]
    relationships = [
        {"sourceId": "p", "targetId": "s1", "type": "contains"},
        {"sourceId": "p", "targetId": "s2", "type": "contains"},
        {"sourceId": "p", "targetId": "s3", "type": "contains"},
        {"sourceId": "p", "targetId": "i", "type": "implements"},
        {"sourceId": "e", "targetId": "p", "type": "validates"},
        {"sourceId": "pol", "targetId": "p", "type": "influences"},
        {"sourceId": "auth", "targetId": "p", "type": "influences"},
    ]
    return {"artifacts": artifacts, "relationships": relationships}


class TestSelectContext(unittest.TestCase):
    def test_bundle_is_subset_of_model(self):
        model = _big_model()
        ids = {a["id"] for a in model["artifacts"]}
        bundle = select_context(model, "s1", max_tokens=1000)
        included_ids = {p["id"] for p in bundle["included"]}
        self.assertLessEqual(included_ids, ids)
        # excluded_count coherente con el total del modelo.
        self.assertEqual(bundle["excluded_count"], len(ids) - len(included_ids))

    def test_disconnected_artifact_never_included(self):
        # 'far' está en otro componente del grafo: jamás entra al contexto del step.
        bundle = select_context(_big_model(), "s1", max_tokens=10_000)
        self.assertNotIn("far", {p["id"] for p in bundle["included"]})

    def test_anchor_step_always_present_and_first(self):
        bundle = select_context(_big_model(), "s2", max_tokens=10_000)
        self.assertEqual(bundle["step_id"], "s2")
        self.assertEqual(bundle["included"][0]["id"], "s2")
        self.assertEqual(bundle["included"][0]["distance"], 0)

    def test_respects_token_budget(self):
        model = _big_model()
        step = next(a for a in model["artifacts"] if a["id"] == "s1")
        anchor_tokens = estimate_tokens(step)
        # Budget apretado: fuerza exclusiones.
        bundle = select_context(model, "s1", max_tokens=anchor_tokens + 5)
        # tokens_used no excede el budget (salvo el ancla, que aquí cabe holgada).
        self.assertLessEqual(bundle["tokens_used"], bundle["tokens_budget"])
        # Con budget apretado se dejaron piezas fuera → hubo compresión real.
        self.assertGreater(bundle["excluded_count"], 0)
        self.assertLess(bundle["compression_ratio"], 1.0)

    def test_anchor_included_even_if_over_budget(self):
        # Budget ridículamente pequeño: el ancla igual entra (nunca se descarta).
        bundle = select_context(_big_model(), "s1", max_tokens=1)
        self.assertEqual(bundle["included"][0]["id"], "s1")
        self.assertEqual(len(bundle["included"]), 1)

    def test_governance_pieces_prioritized_over_sibling_steps(self):
        # Con budget generoso entran policy/authority/intent/evaluation antes que steps hermanos.
        bundle = select_context(_big_model(), "s1", max_tokens=10_000)
        included = {p["id"]: p for p in bundle["included"]}
        for gov in ("pol", "auth", "i", "e", "p"):
            self.assertIn(gov, included, f"governance {gov} debería estar incluido")
        # La policy puntúa por encima de un step hermano (mismo distance, con boost).
        self.assertGreater(included["pol"]["score"], included["s2"]["score"])

    def test_reasons_reference_real_artifacts(self):
        bundle = select_context(_big_model(), "s1", max_tokens=10_000)
        for piece in bundle["included"]:
            self.assertTrue(piece["reason"] and isinstance(piece["reason"], str))
        # La policy explica su rol de gobierno.
        pol = next(p for p in bundle["included"] if p["id"] == "pol")
        self.assertIn("gobierna", pol["reason"].lower())

    def test_unknown_step_raises(self):
        with self.assertRaises(KeyError):
            select_context(_big_model(), "nope")


if __name__ == "__main__":
    unittest.main()
