# F6 — Context Orchestration / token budget

> Estado: ✅ Implementado · Capa: Python (selección de sub-grafo + budget) + JS (panel de contexto) · Dependencias: [F4](F4-harness-loop.md).
>
> **Implementación:** `core/engine/context.py` — pieza pura `select_context(model, step_id,
> max_tokens) → ContextBundle`. En cada step, en vez de volcar el modelo entero, selecciona
> solo el **sub-grafo semántico** relevante: BFS sobre `{artifacts, relationships}` como grafo
> no dirigido desde el step, puntuando por **cercanía** (`1/(1+distancia)`) + un **boost de
> gobernanza** para los artefactos que condicionan la decisión (Policy/Authority/Intent/
> Evaluation y el Process contenedor). El resultado se ordena por relevancia y se llena hasta
> agotar `max_tokens` (estimación ~`len(texto)/4`); el step-ancla nunca se descarta. El bundle
> reporta `included:[{id,name,type,reason,tokens,distance,score}]`, `excluded_count`,
> `tokens_used/tokens_budget` y `compression_ratio` (fracción del modelo completo cargada).
> `runtime.run_process` emite una entrada de traza `kind:"context"` por step **antes del ACT**;
> `app.py`/`server` exponen `contextTokens` (default `DEFAULT_CONTEXT_TOKENS = 120`). UI: el
> panel Run renderiza el bloque CONTEXT — piezas incluidas con su justificación, chips por tipo,
> barra de token budget y `−N% del modelo`. Verificado con 9 tests pytest (subconjunto ⊆
> modelo, artefacto desconectado nunca entra, respeta el budget, ancla siempre presente,
> gobernanza priorizada sobre steps hermanos, reasons referencian artefactos reales) + 1 test de
> integración del runtime + E2E en navegador.

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
