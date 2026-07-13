# F5 — Tools vía MCP

> Estado: ✅ Implementado · Capa: Python (cliente MCP + PEP/PDP) + Node (servidor MCP de prueba) · Dependencias: [F4](F4-harness-loop.md).
>
> **Implementación:** `tools/mcp-notes/` — servidor MCP real (stdio, JSON-RPC 2.0, Node puro)
> con 3 tools anotadas con la semántica MCP estándar (`readOnlyHint`/`destructiveHint`/
> `idempotentHint`): `notes_append` (write), `notes_read` (readOnly), `notes_clear`
> (destructive). `core/engine/mcp_client.py` — cliente MCP mínimo stdlib (initialize →
> tools/list → tools/call). Un step declara su tool con la directiva `tool: nombre {args}` en
> su descripción; el PLAN la parsea y el RUN la ejecuta como acción real. **Permisos
> (PEP/PDP):** readOnly siempre permitido; write requiere una `Authority` conectada al
> proceso; destructive requiere una Authority que lo autorice afirmativamente (las menciones
> negadas — «no destructivas» — NO conceden). La traza emite `tool:authorize` (nivel +
> decisión + razón) y `tool:call`; un bloqueo es violation `error` y detiene el loop. UI: el
> panel Run muestra AUTHORIZE con badge de nivel, la llamada con args y el resultado real.
> Verificado con 7 tests de integración pytest (spawn real del servidor) + E2E en navegador.
> Servidor MCP configurable vía `HEXY_MCP_CMD` (default: el de prueba del repo).

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
