# F5 — Tools vía MCP

> Estado: 📋 Planeado · Capa: TS + Python · Dependencias: [F4](F4-harness-loop.md).
> Nivel de detalle: objetivo + alcance + validación.

## 1. Objetivo
Que los pasos del loop ejecuten **acciones reales** como *tools* vía **MCP (Model Context
Protocol)** — el mecanismo prioritario sobre conectores propietarios — con permisos derivados
de `Authority`. Primer efecto del loop sobre un sistema externo.

## 2. Alcance E2E
- **Tool runner:** `Step.run` invoca una tool por MCP. Empezar con **una** tool ligera y
  segura (p. ej. crear un issue en un tracker de prueba, o un webhook n8n).
- **Permisos:** anotar tools como `readOnly | destructive | idempotent`; el `Guardrail` de
  `Authority` decide si el step puede ejecutarla (base del futuro control plane / PEP-PDP).
- **UI:** en la traza, el step de tool muestra la llamada, el resultado y el chequeo de permiso.

## 3. Criterio de validación (desde el dashboard)
El usuario corre un `Process` cuyo step llama una tool; ve en la traza la **acción real
ejecutada** (con su resultado) y, si el `Authority` no la permite, el step **bloqueado** por el
guardrail.

## 4. Verificación
- Test de integración con un servidor MCP de prueba: step idempotente ejecuta; step
  `destructive` sin authority suficiente → bloqueado.
- La traza refleja llamada/resultado/permiso.

## 5. Dependencias
[F4](F4-harness-loop.md). Habilita flujos de negocio reales (Camino B del dashboard).
