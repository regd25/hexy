# F4 — El loop (HarnessRuntime mínimo)

> Estado: 📋 Planeado · Capa: Python · Dependencias: [F3](F3-engine-bridge.md).
> Nivel de detalle: objetivo + alcance + validación. Diseño base: [harness-runtime.md](../harness-runtime.md).

## 1. Objetivo
Cerrar el **hueco del loop**: implementar el `HarnessRuntime` mínimo que **corre** un
`Process` (`act → observe → validate → decide → repeat`) en vez de solo modelarlo. Es el paso
que convierte "loop engineering" de narrativa en código.

## 2. Alcance E2E
- **Engine:** `HarnessRuntime.run(...)` siguiendo el diseño de
  [harness-runtime.md](../harness-runtime.md): `Process.flow → Step[]`; `Policy → Guardrail[]`;
  `Intent` + `Evaluation` → goal + `TerminationCondition`. Traza en `ExecutionContext`
  (events/observations/violations) usando los helpers `withEvent/withObservation/withViolation`.
- **Steps triviales primero:** acciones simuladas/locales (sin MCP todavía — eso es F5).
- **Streaming:** endpoint `POST /run` (SSE/WebSocket) que emite la traza por step.
- **UI:** panel de ejecución que muestra la traza en vivo: steps, observations y **violations**
  (guardrails) con severidad.

## 3. Criterio de validación (desde el dashboard)
El usuario selecciona un `Process` modelado, pulsa **Run**, y ve la **traza avanzar paso a
paso**; si un `Policy` se incumple, aparece una **violation** y, si es `error`, el loop para.
Al satisfacerse la `Evaluation`, el loop termina con éxito.

## 4. Verificación
- `pytest`: un `Process` fixture corre hasta término; una `Policy` `prohibit` violada produce
  parada con violation `error`; presupuesto agotado termina por `budgetExhausted`.
- La traza llega completa al dashboard vía streaming.

## 5. Dependencias
[F3](F3-engine-bridge.md) (puente + proyección RDF). Habilita [F5](F5-tools-mcp.md) y
[F6](F6-context-orchestration.md).
