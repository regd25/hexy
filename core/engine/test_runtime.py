"""Tests del HarnessRuntime (F4): término, violation fatal, presupuesto, plan failure."""

import pytest

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


def test_plan_derives_steps_goal_termination_guardrails():
    plan = build_plan(_model(), "p")
    assert [s["id"] for s in plan["steps"]] == ["s1", "s2"]
    assert plan["goal"]["id"] == "i"
    assert plan["evaluation"]["id"] == "e"
    assert [g["term"] for g in plan["prohibited"]] == ["eliminar"]


def test_process_runs_to_completion():
    trace = _run(_model())
    done = trace[-1]
    assert done["kind"] == "done" and done["status"] == "completed"
    # act + observation por cada step, y evaluación satisfecha.
    acts = [t for t in trace if t["kind"] == "event" and t.get("name") == "step:act"]
    obs = [t for t in trace if t["kind"] == "observation"]
    assert len(acts) == 2 and len(obs) == 2
    assert any(t.get("name") == "evaluation:satisfied" for t in trace)
    # seq monótono (traza ordenada).
    seqs = [t["seq"] for t in trace]
    assert seqs == sorted(seqs)


def test_prohibit_policy_stops_the_loop_with_error_violation():
    model = _model()
    # El step 1 ahora incumple la policy ("eliminar" en la descripción).
    model["artifacts"][1]["description"] = "Eliminar registros previos del usuario."
    trace = _run(model)
    done = trace[-1]
    assert done["status"] == "stoppedByViolation"
    violations = [t for t in trace if t["kind"] == "violation"]
    assert violations and violations[0]["severity"] == "error"
    assert violations[0]["policy"] == "SinBorrado"
    # Paró en el step 1: el step 2 nunca actuó.
    acts = [t for t in trace if t.get("name") == "step:act"]
    assert len(acts) == 1


def test_budget_exhausted_terminates_the_loop():
    trace = _run(_model(), budget=1)
    done = trace[-1]
    assert done["status"] == "budgetExhausted"
    assert done["completedSteps"] == 1 and done["totalSteps"] == 2


def test_require_policy_emits_warning_but_completes():
    model = _model()
    model["artifacts"][5]["description"] = "Requiere auditoria en todos los pasos."
    trace = _run(model)
    assert trace[-1]["status"] == "completed"
    warnings = [t for t in trace if t["kind"] == "violation" and t["severity"] == "warning"]
    assert warnings and "auditoria" in warnings[0]["message"]


def test_plan_fails_for_process_without_steps():
    model = {
        "artifacts": [{"id": "p", "type": "process", "name": "Vacio", "description": ""}],
        "relationships": [],
    }
    trace = _run(model)
    assert trace[-1]["status"] == "planFailed"
    assert trace[0]["kind"] == "violation" and trace[0]["stage"] == "plan"


def test_plan_error_for_non_process():
    with pytest.raises(PlanError):
        build_plan({"artifacts": [{"id": "x", "type": "intent", "name": "I"}], "relationships": []}, "x")
