# Implementación de Hexy — Roadmap por features

> Plan de construcción **end-to-end** del framework, en *slices* validables desde el
> dashboard en cada iteración. Cada feature tiene su propio documento de plan.
>
> Estado: `draft` · Última actualización: 2026-06-17 · Ancla: [POSITIONING](../../POSITIONING.md).

---

## Principios

1. **Cada feature es un slice E2E validable por el usuario desde el dashboard.** No se cierra
   una feature hasta que su *criterio de validación* es reproducible.
2. **Homologación tecnológica** (decisiones aprobadas): monorepo **pnpm + Turborepo**; una
   **app Next.js única** (landing + dashboard); **SOL** dentro del repo vía **git subtree**.
3. **Frontera de cómputo:** **Next.js (TS)** para UI + funciones ligeras no-core (CRUD,
   validación, export/import `.yaml`); **Python (`core/`)** solo para el motor pesado
   (reasoning OWL/RDF + SPARQL, context orchestration, el `HarnessRuntime`/loop).
4. **Meta-construcción (dogfood):** a partir de F7, Hexy modela y rastrea su propio
   desarrollo como artefactos SOL; el dashboard es el cockpit.
5. **Vocabulario canónico:** `Intent` (no `Purpose`), *harness*, *loop* — ver
   [UBIQUITOUS-LANGUAGE](../UBIQUITOUS-LANGUAGE.md).

---

## Arquitectura objetivo

```
hexy/  (pnpm + turborepo)
├── apps/web/                 # Next.js 14: landing + dashboard + BFF (funciones ligeras)
├── core/                     # Motor Python (FastAPI) — cómputo pesado; fuera del grafo pnpm
├── packages/
│   ├── shared/  → @hexy/shared   # SSOT de tipos
│   └── sol/     → @hexy/sol      # validator + formatter + schema + parser .yaml
├── tools/sol-vscode-extension/   # extensión VS Code (usa @hexy/sol)
└── docs/{sol, hexy/implementation}
```

---

## Roadmap

| # | Feature | Estado | Criterio de validación (desde el dashboard) | Capa | Doc |
|---|---|---|---|---|---|
| **F0** | Homologación & monorepo | 📋 Planeado | `pnpm dev` levanta la app Next.js con el dashboard operativo (paridad) | infra | [F0](F0-homologacion.md) |
| **F1** | Authoring loop (TS-only) ⭐ | 🔨 En curso (vía rápida) | Autoro un artefacto, veo validación en vivo y exporto un `.yaml` válido | TS | [F1](F1-authoring-loop.md) |
| **F2** | Round-trip import | 📋 Planeado | Importo el `.yaml` de F1 y lo veo como grafo válido | TS | [F2](F2-round-trip-import.md) |
| **F3** | Engine bridge (light↔heavy) | 📋 Planeado | Veo inferencias/relaciones que el lado TS no calcula | TS+Py | [F3](F3-engine-bridge.md) |
| **F4** | El loop (HarnessRuntime mínimo) | 📋 Planeado | Ejecuto un `Process` y veo la traza + violations en vivo | Py | [F4](F4-harness-loop.md) |
| **F5** | Tools vía MCP | 📋 Planeado | Un paso del loop hace una acción de integración real (ligera) | TS+Py | [F5](F5-tools-mcp.md) |
| **F6** | Context Orchestration / token budget | 📋 Planeado | Veo el "porqué" de cada pieza de contexto y el presupuesto | Py | [F6](F6-context-orchestration.md) |
| **F7** | Meta-construcción (dogfood) | 📋 Planeado | El framework modela y rastrea su propio build | TS+Py | [F7](F7-meta-construccion.md) |
| **F8** | Persistencia, auth, observabilidad | 📋 Planeado | Mis modelos persisten; los runs son auditables | TS+Py | [F8](F8-persistencia-observabilidad.md) |
| **F9** | Conclusión / empaquetado | 📋 Planeado | Instalo limpio, despliego y la extensión funciona | infra | [F9](F9-conclusion.md) |

**"Concluido" =** modelar un dominio → validarlo → correr un loop gobernado por dominio
sobre funciones ligeras (TS) y pesadas (Py) → ejecutar flujos con tools (MCP) → y
meta-construir.

---

## Convención de cada documento `F{n}`

1. **Objetivo** y por qué es el siguiente slice.
2. **Alcance E2E** (UI / BFF / package / engine).
3. **Criterio de validación desde el dashboard** (qué hace el usuario para aceptarla).
4. **Archivos a crear/modificar** (rutas reales; reutilizar lo existente).
5. **Verificación** (`pnpm`/tests/MCP/engine).
6. **Dependencias** (features previas).

> Detalle ejecutable completo: **F0** y **F1**. F2–F9 traen objetivo + alcance + criterio de
> validación; se profundizan al llegar a cada una.
