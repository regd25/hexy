"""Tests del HarnessRuntime (F4): término, violation fatal, presupuesto, plan failure."""

import os
import tempfile
import unittest
from pathlib import Path

from runtime import build_plan, run_process, PlanError


def _model():
    """Process con 2 steps, intent (goal), evaluation (término) y una policy prohibit."""
    return {
        "artifacts": [
            {"id": "p", "type": "process", "name": "Onboarding", "description": "Proceso de alta."},
            {"id": "s1", "type": "procedure", "name": "Validar identidad", "description": "Verificar documentos."},
            {"id": "s2", "type": "procedure", "name": "Crear cuenta", "description": "Alta en el sistema."},
            {"id": "i", "type": "intent", "name": "AltaConfiable", "description": "Altas confiables."},
            {"id": "e", "type": "evaluation", "name": "AltaCompleta", "description": "Cuenta creada y validada."},
            {"id": "pol", "type": "policy", "name": "SinBorrado", "description": "Queda prohibido eliminar registros."},
        ],
        "relationships": [
            {"sourceId": "p", "targetId": "s1", "type": "contains"},
            {"sourceId": "p", "targetId": "s2", "type": "contains"},
            {"sourceId": "p", "targetId": "i", "type": "implements"},
            {"sourceId": "e", "targetId": "p", "type": "validates"},
            {"sourceId": "pol", "targetId": "p", "type": "influences"},
        ],
    }


def _run(model, pid="p", budget=20):
    return list(run_process(model, pid, budget))


class TestHarnessRuntime(unittest.TestCase):
    def test_plan_derives_steps_goal_termination_guardrails(self):
        plan = build_plan(_model(), "p")
        self.assertEqual([s["id"] for s in plan["steps"]], ["s1", "s2"])
        self.assertEqual(plan["goal"]["id"], "i")
        self.assertEqual(plan["evaluation"]["id"], "e")
        self.assertEqual([g["term"] for g in plan["prohibited"]], ["eliminar"])

    def test_process_runs_to_completion(self):
        trace = _run(_model())
        done = trace[-1]
        self.assertEqual(done["kind"], "done")
        self.assertEqual(done["status"], "completed")
        # act + observation por cada step, y evaluación satisfecha.
        acts = [t for t in trace if t["kind"] == "event" and t.get("name") == "step:act"]
        obs = [t for t in trace if t["kind"] == "observation"]
        self.assertEqual(len(acts), 2)
        self.assertEqual(len(obs), 2)
        self.assertTrue(any(t.get("name") == "evaluation:satisfied" for t in trace))
        # seq monótono (traza ordenada).
        seqs = [t["seq"] for t in trace]
        self.assertEqual(seqs, sorted(seqs))

    def test_prohibit_policy_stops_the_loop_with_error_violation(self):
        model = _model()
        # El step 1 ahora incumple la policy ("eliminar" en la descripción).
        model["artifacts"][1]["description"] = "Eliminar registros previos del usuario."
        trace = _run(model)
        done = trace[-1]
        self.assertEqual(done["status"], "stoppedByViolation")
        violations = [t for t in trace if t["kind"] == "violation"]
        self.assertTrue(violations)
        self.assertEqual(violations[0]["severity"], "error")
        self.assertEqual(violations[0]["policy"], "SinBorrado")
        # Paró en el step 1: el step 2 nunca actuó.
        acts = [t for t in trace if t.get("name") == "step:act"]
        self.assertEqual(len(acts), 1)

    def test_context_entry_emitted_per_step_before_act(self):
        """F6: cada step emite una entrada `context` (sub-grafo + budget) antes de actuar."""
        trace = _run(_model())
        contexts = [t for t in trace if t["kind"] == "context"]
        acts = [t for t in trace if t.get("name") == "step:act"]
        self.assertEqual(len(contexts), 2)
        self.assertEqual(len(acts), 2)
        # El context de cada step precede a su act (misma numeración de step).
        for ctx, act in zip(contexts, acts):
            self.assertEqual(ctx["step"], act["step"])
            self.assertLess(trace.index(ctx), trace.index(act))
        # Bundle bien formado y con selección semántica (el step ancla incluido, budget reportado).
        first = contexts[0]
        self.assertTrue(first["included"])
        self.assertEqual(first["included"][0]["id"], "s1")
        self.assertLessEqual(first["tokensUsed"], first["tokensBudget"])
        self.assertTrue(0 < first["compressionRatio"] <= 1.0)

    def test_budget_exhausted_terminates_the_loop(self):
        trace = _run(_model(), budget=1)
        done = trace[-1]
        self.assertEqual(done["status"], "budgetExhausted")
        self.assertEqual(done["completedSteps"], 1)
        self.assertEqual(done["totalSteps"], 2)

    def test_require_policy_emits_warning_but_completes(self):
        model = _model()
        model["artifacts"][5]["description"] = "Requiere auditoria en todos los pasos."
        trace = _run(model)
        self.assertEqual(trace[-1]["status"], "completed")
        warnings = [t for t in trace if t["kind"] == "violation" and t["severity"] == "warning"]
        self.assertTrue(warnings)
        self.assertIn("auditoria", warnings[0]["message"])

    def test_plan_fails_for_process_without_steps(self):
        model = {
            "artifacts": [{"id": "p", "type": "process", "name": "Vacio", "description": ""}],
            "relationships": [],
        }
        trace = _run(model)
        self.assertEqual(trace[-1]["status"], "planFailed")
        self.assertEqual(trace[0]["kind"], "violation")
        self.assertEqual(trace[0]["stage"], "plan")

    def test_plan_error_for_non_process(self):
        with self.assertRaises(PlanError):
            build_plan({"artifacts": [{"id": "x", "type": "intent", "name": "I"}], "relationships": []}, "x")


# --- F5: tools reales vía MCP + permisos por Authority (integración con tools/mcp-notes) ---


def _tool_model(step_desc, authority_desc=None):
    """Process con un step-tool y (opcional) una Authority conectada."""
    artifacts = [
        {"id": "p", "type": "process", "name": "Registro", "description": "Proceso con tool."},
        {"id": "s", "type": "procedure", "name": "Anotar", "description": step_desc},
    ]
    relationships = [{"sourceId": "p", "targetId": "s", "type": "contains"}]
    if authority_desc is not None:
        artifacts.append({"id": "auth", "type": "authority", "name": "OpsLead", "description": authority_desc})
        relationships.append({"sourceId": "auth", "targetId": "p", "type": "influences"})
    return {"artifacts": artifacts, "relationships": relationships}


class TestToolsViaMcp(unittest.TestCase):
    """Sustituye la fixture pytest notes_file (tmp_path + monkeypatch) con setUp/tearDown."""

    def setUp(self):
        self._tmpdir = tempfile.TemporaryDirectory()
        self.notes_file = Path(self._tmpdir.name) / "notes.md"
        self._prev_env = os.environ.get("HEXY_NOTES_FILE")
        os.environ["HEXY_NOTES_FILE"] = str(self.notes_file)

    def tearDown(self):
        if self._prev_env is None:
            os.environ.pop("HEXY_NOTES_FILE", None)
        else:
            os.environ["HEXY_NOTES_FILE"] = self._prev_env
        self._tmpdir.cleanup()

    def test_tool_step_executes_via_mcp_with_authority(self):
        model = _tool_model('tool: notes_append {"text": "hola desde el loop"}', "Autoriza la operación del registro.")
        trace = _run(model)
        self.assertEqual(trace[-1]["status"], "completed")
        auth = next(t for t in trace if t.get("name") == "tool:authorize")
        self.assertIs(auth["allowed"], True)
        self.assertEqual(auth["level"], "write")
        call = next(t for t in trace if t.get("name") == "tool:call")
        self.assertEqual(call["tool"], "notes_append")
        obs = next(t for t in trace if t["kind"] == "observation")
        self.assertIn("Nota añadida", obs["content"])
        # Efecto real sobre el sistema externo.
        self.assertIn("hola desde el loop", self.notes_file.read_text())

    def test_write_tool_blocked_without_authority(self):
        trace = _run(_tool_model('tool: notes_append {"text": "no debería escribirse"}'))
        self.assertEqual(trace[-1]["status"], "stoppedByViolation")
        auth = next(t for t in trace if t.get("name") == "tool:authorize")
        self.assertIs(auth["allowed"], False)
        violation = next(t for t in trace if t["kind"] == "violation")
        self.assertEqual(violation["stage"], "authorize")
        self.assertEqual(violation["severity"], "error")
        self.assertFalse(self.notes_file.exists())

    def test_destructive_tool_blocked_with_plain_authority(self):
        # Una Authority normal permite write pero NO destructive.
        trace = _run(_tool_model("tool: notes_clear", "Autoriza operaciones normales."))
        self.assertEqual(trace[-1]["status"], "stoppedByViolation")
        auth = next(t for t in trace if t.get("name") == "tool:authorize")
        self.assertEqual(auth["level"], "destructive")
        self.assertIs(auth["allowed"], False)

    def test_negated_destructive_mention_does_not_grant(self):
        # Regresión: «(no destructivas)» contiene la subcadena pero NIEGA el permiso.
        self.notes_file.write_text("- previa\n")
        trace = _run(_tool_model("tool: notes_clear", "Autoriza escritura del registro (no destructivas)."))
        self.assertEqual(trace[-1]["status"], "stoppedByViolation")
        auth = next(t for t in trace if t.get("name") == "tool:authorize")
        self.assertIs(auth["allowed"], False)
        self.assertEqual(self.notes_file.read_text(), "- previa\n")  # el archivo NO se tocó

    def test_destructive_tool_executes_with_destructive_authority(self):
        self.notes_file.write_text("- previa\n")
        trace = _run(_tool_model("tool: notes_clear", "Autoriza también acciones destructivas."))
        self.assertEqual(trace[-1]["status"], "completed")
        self.assertEqual(self.notes_file.read_text(), "")

    def test_readonly_tool_allowed_without_any_authority(self):
        self.notes_file.write_text("- una nota\n")
        trace = _run(_tool_model("tool: notes_read"))
        self.assertEqual(trace[-1]["status"], "completed")
        auth = next(t for t in trace if t.get("name") == "tool:authorize")
        self.assertEqual(auth["level"], "readOnly")
        self.assertIs(auth["allowed"], True)
        obs = next(t for t in trace if t["kind"] == "observation")
        self.assertIn("una nota", obs["content"])

    def test_unknown_tool_fails_explicitly(self):
        trace = _run(_tool_model("tool: notes_nuke", "Autoriza todo, incluso destructivas."))
        self.assertEqual(trace[-1]["status"], "toolFailed")
        violation = next(t for t in trace if t["kind"] == "violation")
        self.assertIn("desconocida", violation["message"].lower())


if __name__ == "__main__":
    unittest.main()
