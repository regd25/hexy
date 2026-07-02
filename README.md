# 🧠 Hexy — el harness de un Domain-Driven AI Framework

**Hexy** es la **capa de ejecución** de un *Domain-Driven AI Framework*: el **harness** que
carga, valida y **corre el loop** del agente usando artefactos de negocio versionados como
*guardrails*, *tools* y criterios de término. Su lenguaje de dominio es
**[SOL — Semantic Operations Language](../sol)** (repo hermano).

> **Tesis:** *Tus artefactos de negocio son las guardrails del loop del agente.*
> No es otro orquestador de LLMs — es el loop gobernado por el dominio, no por prompts ad-hoc.
>
> 📐 Lee primero el **[documento de posicionamiento](docs/POSITIONING.md)**.

---

## 🧱 Arquitectura de dos capas

| Capa | Repo | Responsabilidad |
|---|---|---|
| **Lenguaje / Dominio** | [`../sol`](../sol) | *Ubiquitous Language ejecutable*: 17 artefactos `.yaml`, composición DRY, **referencias semánticas anti-alucinación** (`Actor:X`). |
| **Ejecución / Harness** | este repo (`hexy`) | **HarnessRuntime** (el loop), Context Orchestration, Semantic Engine OWL/RDF, ExecutionContext (traza), API REST y dashboard. |

Las dos capas evolucionan a ritmos distintos: SOL al ritmo del **negocio**, Hexy al ritmo
de la **tecnología**. Ver [POSITIONING §2](docs/POSITIONING.md#2-arquitectura-de-dos-capas).

---

## 🎯 Propósito

Hexy transforma cómo las organizaciones definen y ejecutan sus operaciones, mediante una
capa de **validación y orquestación semántica** basada en **artefactos** (Intent, Context,
Authority, Evaluation, Process, Policy, Actor, Area, …) que describen intenciones,
condiciones, actores y flujos de forma estructurada y auditable.

---

## 🚀 Características principales

- ⚙️ **Semantic Engine** — interpreta artefactos (OWL/RDF + SPARQL) y decide qué ejecutar,
  validar o rechazar según reglas organizacionales. (`core/hexy-ontology-manager.py`,
  `core/hexy-rdf-processor.py`)
- 🔁 **Context Orchestration** — pipeline `cache → memory → select → compress → explain`
  con explicabilidad nativa. (`core/hexy-context-orchestrator.py`)
- 📦 **ExecutionContext** — traza inmutable: actor, propósito, inputs, events, observations,
  violations. (`shared/types/ExecutionContext.ts`)
- 🧰 **HarnessRuntime** *(en diseño)* — corre el loop `act → observe → validate → decide →
  repeat`. (`docs/hexy/harness-runtime.md`)
- 🧩 **Tools / Plugins** — vía **MCP** (prioritario), Jira, n8n, AWS Step Functions, REST.
- 🌐 **API REST** — backend **Node.js puro** (`node:http`, `server/`) con **YAML versionable
  como fuente de verdad** + índice **SQLite** (`node:sqlite`) reconstruible.
- 🖥️ **Dashboard vanilla** (JS + CSS, sin framework) para autorar artefactos y relaciones
  contra esa API.

---

## 🧬 Arquitectura interna

Hexy sigue principios de **arquitectura hexagonal**, **DDD** y **event-driven**. Opera en
dos modos:

1. **Modo Orquestador** — ejecuta paso a paso un proceso definido, evaluando condiciones.
2. **Modo Reactivo** — escucha eventos y valida si cada acción es coherente, permitida o
   requiere intervención.

> Ambos modos se reencuadran como **el loop** del harness en
> [`docs/hexy/harness-runtime.md`](docs/hexy/harness-runtime.md).

---

## 📁 Estructura real del repositorio

```
hexy/
├── core/        # Semantic Engine Python: prototipo (hexy-*.py) + engine/ (FastAPI RDF+inferencias, F3)
├── server/      # Backend Node.js puro (node:http): YAML (fuente de verdad) + índice SQLite
├── shared/      # Single Source of Truth (TS): types/, events/, repository/, adapters/
├── dashboard/   # UI de artefactos (vanilla JS + CSS, bundleada con Vite)
├── tools/       # Servidores MCP: mcp-notes (tool server de prueba del HarnessRuntime, F5)
├── landing/     # Landing page (Next.js)  ·  contenido de "Visión", no de runtime
├── docs/        # Documentación  →  empezar por docs/POSITIONING.md
└── specs/       # Especificaciones del dashboard
```

> ℹ️ **Nota de migración.** El core original en TypeScript (`core/*.ts`) fue **eliminado** y
> reemplazado por `shared/` (Single Source of Truth) + un core en **Python**. La
> documentación con carpetas `plugins/ agents/ lib/` describía una estructura anterior que
> **ya no existe**.

---

## 📚 Documentación

| Documento | Qué es |
|---|---|
| [`docs/POSITIONING.md`](docs/POSITIONING.md) | **Empezar aquí.** Catálogo, tesis de 2 capas, mapeo vs AI engineering 2026, diferenciadores, visión vs implementado. |
| [`docs/hexy/UBIQUITOUS-LANGUAGE.md`](docs/hexy/UBIQUITOUS-LANGUAGE.md) | Vocabulario canónico unificado SOL↔Hexy (fuente de verdad). |
| [`docs/hexy/harness-runtime.md`](docs/hexy/harness-runtime.md) | Diseño del loop y contrato de integración SOL→Hexy. |
| [`docs/hexy/dashboard.md`](docs/hexy/dashboard.md) | El dashboard como herramienta de modelado de sistemas de dominio (model→code y ejecución de flujos). |
| [`core/IMPLEMENTATION-STATUS.md`](core/IMPLEMENTATION-STATUS.md) | Estado histórico del core Python (sep-2025). |

---

## 🤖 Requisitos

- **Node.js >= 22** — requerido por `server/` (usa `node:sqlite`, nativo desde Node 22).
- Python >= 3.10 (core / Semantic Engine)
- Docker (opcional, para infraestructura local)
- Gestor de paquetes: **pnpm** (monorepo con turbo).

---

## ▶️ Cómo ejecutar (backend + dashboard)

```bash
pnpm install

# Terminal 1 — backend Node.js puro (datos persistentes en server/data/)
pnpm --filter hexy-server dev        # http://localhost:4000

# Terminal 2 — dashboard vanilla (proxy /api → :4000)
pnpm --filter hexy-dashboard dev     # http://localhost:3000

# Terminal 3 (opcional) — motor Python (RDF + inferencias, F3)
cd core/engine && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt
cd core/engine && ./.venv/bin/uvicorn app:app --port 8000   # http://localhost:8000
```

> El motor (`core/engine/`) es opcional: el dashboard funciona sin él; el botón **"Analizar
> con el motor"** requiere que esté corriendo (el backend hace de proxy vía `HEXY_ENGINE_URL`).

- **YAML = fuente de verdad** versionable en `server/data/` (un `.yaml` por artefacto).
- **SQLite = índice derivado** (`server/data/hexy.db`, gitignored); se reconstruye desde los
  YAML al arrancar. Detalle de la API y la arquitectura en [`server/README.md`](server/README.md).
- Tests del backend: `pnpm --filter hexy-server test` (`node --test`).

---

## 🧭 Visión a futuro

Encuadrada por las tres fuerzas que mueven el campo (ver
[POSITIONING §5](docs/POSITIONING.md#5-las-tres-fuerzas-hacia-dónde-avanzar)):

- **Límite de tokens** → la semántica como compresión (retrieval de sub-grafo SOL vía SPARQL).
- **Cómputo distribuido** → harness como **AI control plane** (MCP, permisos, sub-agentes
  por `Area`).
- **Estado del arte** → cerrar el **hueco del loop** con un `HarnessRuntime` mínimo.

---

## 📡 Contribuciones

Proyecto en desarrollo activo. Cada PR debe incluir un `.md` que describa el artefacto o
ajuste propuesto. Ver [guía de contribución](docs/CONTRIBUTING.md). Todo término nuevo se
fija primero en [`UBIQUITOUS-LANGUAGE.md`](docs/hexy/UBIQUITOUS-LANGUAGE.md).

---

## 🧠 ¿Quién está detrás?

Desarrollado por [Rednell Labs](https://github.com/regd25) como parte de su iniciativa de
evolución organizacional AI-first.

## 📄 Licencia

MIT License. Ver [LICENSE](./LICENSE).
