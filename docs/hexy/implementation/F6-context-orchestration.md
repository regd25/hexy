# F6 — Context Orchestration / token budget

> Estado: 📋 Planeado · Capa: Python · Dependencias: [F4](F4-harness-loop.md).
> Nivel de detalle: objetivo + alcance + validación.

## 1. Objetivo
Integrar el `ContextOrchestrator` (ya implementado en `core/hexy-context-orchestrator.py`)
**dentro del loop**: que cada decisión use **retrieval de sub-grafo (SPARQL) + compresión +
explicación**, tratando la semántica como **motor de presupuesto de tokens**. Materializa el
diferenciador "semántica como compresión".

## 2. Alcance E2E
- **Engine:** el `HarnessRuntime` consulta al `ContextOrchestrator` para seleccionar solo el
  sub-grafo de artefactos relevante a cada step (no volcar todo el modelo). Devuelve
  `ContextBundle` + `compression_ratio` + explicaciones (causal/contrastiva/contrafactual).
- **UI:** panel "Contexto" que muestra, por step, **qué artefactos se incluyeron, por qué, y el
  presupuesto de tokens** usado vs. disponible.

## 3. Criterio de validación (desde el dashboard)
Durante un run, el usuario abre el panel de contexto y ve, por cada decisión, la **lista de
piezas incluidas con su justificación** y el **token budget** — evidencia de selección
semántica, no de volcado.

## 4. Verificación
- `pytest`: para un modelo grande, el contexto seleccionado por step ⊂ modelo completo y
  respeta `max_context_length`; las explicaciones referencian artefactos reales.
- La UI muestra ratio de compresión y el "porqué".

## 5. Dependencias
[F4](F4-harness-loop.md). Refuerza F5–F7 (menos tokens, decisiones explicables).
