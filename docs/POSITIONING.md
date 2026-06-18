# SOL + Hexy — A Domain-Driven AI Framework

> **Posicionamiento oficial / Official positioning.**
> Documento ancla que cataloga el proyecto, fija su vocabulario y lo contrasta con el
> estado del arte de *AI engineering* (2026). Bilingüe por diseño: **prosa conceptual en
> español, términos técnicos en inglés** (ver [convención de idioma](#convención-de-idioma)).
>
> Estado: `draft` · Última actualización: 2026-06-17 · Reemplaza el encuadre "vs LangChain".

---

## TL;DR

**SOL + Hexy es un *Domain-Driven AI Framework* de dos capas.**

- **SOL — Semantic Operations Language** es la **capa de lenguaje/dominio**: un
  *Ubiquitous Language ejecutable*. Define el negocio como **artefactos versionados**
  (`.sop`) con **referencias semánticas verificables** (`Actor:X`, `Process:Y`) que son
  *anti-alucinación por diseño*.
- **Hexy** es la **capa de ejecución**: el **harness** que carga, valida y **corre el loop**
  del agente, usando los artefactos SOL como *guardrails*, *tools* y *criterios de término*.
- La **semántica OWL/RDF** sustenta ambas: desambiguación, **presupuesto de tokens** por
  recuperación de sub-grafo, y **explicabilidad nativa**.

El diferenciador no es "otro orquestador de LLMs". Es: **el loop del agente gobernado por
artefactos de negocio versionados, no por prompts ad-hoc.**

> **Tagline:** *Your business artifacts are the guardrails of the agent's loop.*
> *Tus artefactos de negocio son las guardrails del loop del agente.*

---

## 1. El problema que resuelve

Los agentes de IA son **amplificadores confiados del vocabulario que reciben**. Sin
definiciones precisas, generan código y decisiones plausibles pero semánticamente
incorrectas, mezclando lógica de contextos que deberían estar separados. La disciplina de
2026 (ver [§6](#6-mapa-contra-el-estado-del-arte-2026)) llegó a una conclusión:
**el Ubiquitous Language del Domain-Driven Design es la fuente de verdad que ancla al
agente** y los **bounded contexts** son sus *guardrails*.

SOL+Hexy fue diseñado alrededor de esa idea **antes de que tuviera nombre**:

- SOL formaliza el Ubiquitous Language como **artefactos componibles** y prohíbe los
  strings genéricos (`"[ResponsibleActorId]"`) en favor de **referencias tipadas y
  verificables** (`Authority:ConsejoDirectivo`). Esto es, literalmente, anti-alucinación.
- Hexy ejecuta esos artefactos como un **loop con guardrails de dominio**, dejando traza
  completa (`ExecutionContext`).

---

## 2. Arquitectura de dos capas

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA DE LENGUAJE / DOMINIO  ·  SOL (Semantic Operations Language)     │
│                                                                        │
│  Ubiquitous Language ejecutable · 17 artefactos · composición DRY      │
│  Bloques fundacionales: Intent · Context · Authority · Evaluation      │
│  Referencias semánticas anti-alucinación: Actor:X, Process:Y           │
│  Bounded contexts: jerarquía estratégico/táctico/operacional + Area    │
│  Tooling: .sop (YAML), JSON Schema, validator, VS Code language server │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │  contrato de carga/validación/ejecución
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CAPA DE EJECUCIÓN  ·  Hexy (the harness)                              │
│                                                                        │
│  HarnessRuntime: act → observe → validate → decide → repeat  (el loop) │
│  Context Orchestration: cache → memory → select → compress → explain   │
│  ExecutionContext: traza inmutable (events · observations · violations)│
│  Semantic Engine: OWL/RDF + SPARQL (Owlready2 / RDFLib)                │
│  Observabilidad + EventBus + ValidationService (eval gate)             │
└───────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
        Tools / Integrations  ·  MCP · Jira · n8n · AWS Step Functions
```

**Por qué dos capas y no una:** la capa de lenguaje (SOL) cambia al ritmo del *negocio*
(versionada en git, revisada por humanos); la capa de ejecución (Hexy) cambia al ritmo de
la *tecnología* (modelos, runtimes, tools). Separarlas permite evolucionar el harness sin
reescribir el dominio, y viceversa.

---

## 3. Glosario híbrido (Ubiquitous Language ↔ industria)

La regla del enfoque **híbrido**: los **artefactos** conservan su nombre de dominio (SOL);
la **capa de ejecución** adopta el vocabulario de industria (harness, loop). Cada término
se define **una sola vez**; su detalle canónico vive en
[`docs/hexy/UBIQUITOUS-LANGUAGE.md`](hexy/UBIQUITOUS-LANGUAGE.md).

| Término del proyecto | Definición | Nombre en la industria 2026 |
|---|---|---|
| **Artifact (SOL)** | Unidad de dominio versionada (`.sop`) con `meta`/`uses`/`relationships` | *Spec-as-code* / unidad del Ubiquitous Language |
| **Intent / Context / Authority / Evaluation** | Los 4 bloques fundacionales reutilizables | Foundational vocabulary (DDD) |
| **Referencia semántica** (`Actor:X`) | Puntero tipado y verificable entre artefactos | *Grounding* anti-hallucination |
| **Area + jerarquía** | Frontera lingüística donde aplica un modelo | **Bounded context** / guardrail |
| **HarnessRuntime (Hexy)** | El entorno que corre al agente con scaffolding y guardrails | **Harness** |
| **El loop** (ciclo de `ExecutionContext`) | act → observe → decide → repeat con término | **Agent loop** / loop engineering |
| **Context Orchestration** | Selección + compresión + explicación del contexto | **Context engineering** |
| **ExecutionContext** | Traza inmutable (events/observations/violations) | *Trace* / observability state |
| **ValidationService + SOL validator** | Chequeo determinista de coherencia/referencias | **Eval gate** / verification |
| **Violation** | Incumplimiento de una regla de artefacto | **Guardrail breach** |
| **Plugin / Connector** | Acción del agente sobre un sistema externo | **Tool** (MCP) |
| **Visión "microservicios/event-driven"** | Permisos + tools + sub-agentes centralizados | **AI control plane** |

### Convención de idioma

- **Español** para prosa explicativa, visión y narrativa de negocio.
- **Inglés** para nombres de artefactos, identificadores de código y términos técnicos de
  industria (harness, loop, bounded context, eval gate, control plane, tool, guardrail).
- No se traduce un término técnico una vez fijado en inglés (evita sinónimos divergentes).

---

## 4. Los diferenciadores reales

Solo se listan capacidades con respaldo en el código o en specs del repo. Lo aspiracional
está en [§7](#7-visión-vs-implementado).

1. **Ubiquitous Language anti-alucinación (SOL).**
   Las referencias verificables (`docs/templates/SEMANTIC_REFERENCE_RULES.md` en SOL)
   convierten el vocabulario de negocio en *grounding* que el agente no puede inventar.
   Es el moat: ningún framework de prompts/cadenas ofrece esto a nivel de lenguaje.

2. **Semántica como presupuesto de tokens.**
   La composición DRY de SOL (`uses:`) de-duplica a nivel de spec; el `Semantic Engine` de
   Hexy recupera **solo el sub-grafo relevante vía SPARQL** en vez de volcar contexto. La
   ontología deja de venderse como "web semántica" y pasa a ser un **token-budget engine**.

3. **Explicabilidad nativa.**
   El `ContextOrchestrator` produce explicaciones (causal, contrastiva, contrafactual) de
   *por qué* se incluyó cada pieza de contexto — observabilidad del loop por construcción.

4. **Trazabilidad inmutable.**
   `ExecutionContext` (`shared/types/ExecutionContext.ts`) registra actor, propósito,
   inputs, events, observations y violations — auditoría completa de cada corrida del loop.

---

## 5. Las tres fuerzas (hacia dónde avanzar)

Dirección técnica encuadrada por las fuerzas que están moviendo el campo.

### 5.1 Límite de tokens → la semántica como compresión
- **Ahora:** el orquestador comprime y trunca por `max_context_length`.
- **Siguiente:** *retrieval* de sub-grafo SOL por SPARQL + ranking semántico; servir el
  artefacto y sus `uses:` transitivos, no el documento entero. Reportar el "porqué" de cada
  inclusión como parte del presupuesto.

### 5.2 Cómputo distribuido → harness como control plane
- **Ahora:** runtime monolítico con dos modos (orquestador / reactivo).
- **Siguiente:** patrón *AI control plane* — PEP/PDP de permisos, **MCP como mecanismo de
  tools** (priorizar sobre conectores LLM propietarios), **sub-agentes aislados por
  bounded context = `Area` SOL**. Esto aterriza la visión "microservicios/event-driven"
  del roadmap en un patrón con nombre.

### 5.3 Estado del arte → cerrar el hueco del loop
- **Ahora:** `ExecutionContext` *modela* el ciclo pero **no lo corre**.
- **Siguiente:** un `HarnessRuntime` mínimo (`act → observe → validate → decide → repeat`)
  con condición de término explícita; **violations SOL = guardrails**, **validations
  deterministas = feedback verificable**. Spec en
  [`docs/hexy/harness-runtime.md`](hexy/harness-runtime.md).

---

## 6. Mapa contra el estado del arte (2026)

La industria nombró una progresión de cuatro capas. SOL+Hexy las cubre así:

| Capa 2026 | Qué es | En el proyecto | Estado |
|---|---|---|---|
| **Prompt engineering** | Optimizar instrucciones de un turno | Plantillas/explicaciones | implícito |
| **Context engineering** | Curar el set de tokens entre turnos | `ContextOrchestrator` + `ContextBundle` | ✅ fuerte |
| **Harness engineering** | Scaffolding, tools, guardrails, permisos, observabilidad | HarnessRuntime + EventBus + ValidationService + plugins | 🟡 parcial |
| **Loop engineering** | Ciclo act→observe→decide→repeat con término | `ExecutionContext` (modela, no corre) | 🔴 hueco |
| **DDD / Ubiquitous Language** | Vocabulario como fuente de verdad anti-ambigüedad | **SOL completo** | ✅✅ central |
| **Bounded contexts** | Fronteras lingüísticas como guardrails | jerarquía SOL + `Area` + "cross-area solo vía Events" | ✅ formalizado |
| **Tools / MCP** | Acciones del agente | plugins citados (Jira/n8n/MCP) | 🟡 no implementado |
| **Memory & state** | Persistencia entre sesiones | memoria con TTL (in-memory) | 🟡 sin persistencia |
| **Verification / evals** | Señales deterministas como feedback | ValidationService + validator SOL | 🟡 no conectado al loop |
| **Observability / tracing** | Visibilidad de decisiones | Observation/Violation + métricas | ✅ base buena |
| **Control plane / sub-agents** | Topologías + permisos centralizados | visión microservicios | 🔴 no implementado |

**Lectura:** la mitad *lenguaje/dominio* (SOL) es el moat y está madura conceptualmente;
la mitad *ejecución/loop* (Hexy) es donde está el trabajo de ingeniería pendiente.

---

## 7. Visión vs. Implementado

| Capacidad | Estado | Evidencia / Nota |
|---|---|---|
| 17 artefactos SOL + composición DRY | ✅ Implementado | `../sol/docs/templates/*.sop` |
| Reglas de referencia anti-alucinación | ✅ Documentado | `../sol/docs/templates/SEMANTIC_REFERENCE_RULES.md` |
| Schema + validator + VS Code extension | 🟡 Dev build (v0.0.3-dev) | tests fallan, e2e no validado |
| Motor OWL/RDF + SPARQL | ✅ Implementado | `core/hexy-ontology-manager.py`, `core/hexy-rdf-processor.py` |
| Context Orchestration | ✅ Implementado | `core/hexy-context-orchestrator.py` |
| API REST (FastAPI) | ✅ Implementado | `core/hexy-fastapi-server.py` |
| Dashboard React + D3 | 🟡 Parcial | arquitectura 100%, features ~25% |
| **HarnessRuntime (loop real)** | 🔴 No implementado | solo modelado en `ExecutionContext` |
| Conectores LLM (OpenAI/Anthropic) | 🔴 No implementado | declarado en config, sin código |
| Tools vía MCP | 🔴 No implementado | citado en README |
| Persistencia (Redis/Postgres) | 🔴 No implementado | configurado, sin integración |
| Contrato de integración SOL→Hexy | 🔴 No especificado | ver harness-runtime.md (a crear) |
| Dashboard como modelado de dominio | 🟡 Parcial | arquitectura ~100%, features ~25% — ver [dashboard.md](hexy/dashboard.md) |
| Model→code (sistemas de dominio) | 🌟 Visión | Camino A del dashboard; depende de export `.sop` + HarnessRuntime |
| Ejecución de flujos de negocio | 🌟 Visión | Camino B del dashboard; depende del HarnessRuntime |
| SCL / SOL como lenguaje en landing | 🌟 Visión | `landing/` — separar de "implementado" |
| Federated / RL / multimodal | 🌟 Visión | roadmap nivel 4 |

---

## 8. Referencias (terminología 2026)

- [What Is Loop Engineering? — Tosea.ai](https://tosea.ai/blog/loop-engineering-ai-agents-complete-guide-2026)
- [awesome-harness-engineering — GitHub](https://github.com/ai-boost/awesome-harness-engineering)
- [Harness Engineering for AI Coding Agents — Augment Code](https://www.augmentcode.com/guides/harness-engineering-ai-coding-agents)
- [Agent Harness Engineering: The Rise of the AI Control Plane — Medium](https://medium.com/@adnanmasood/agent-harness-engineering-the-rise-of-the-ai-control-plane-938ead884b1d)
- [Solving AI Agent Ambiguity with DDD's Ubiquitous Language — Dev|Journal](https://earezki.com/ai-news/2026-05-21-your-agent-keeps-using-that-word-/)
- [Domain Driven Agent Design — Russ Miles](https://engineeringagents.substack.com/p/domain-driven-agent-design)

---

## Documentos relacionados

- [`docs/hexy/UBIQUITOUS-LANGUAGE.md`](hexy/UBIQUITOUS-LANGUAGE.md) — referencia canónica del vocabulario unificado SOL↔Hexy.
- [`docs/hexy/harness-runtime.md`](hexy/harness-runtime.md) — diseño del HarnessRuntime y contrato SOL→Hexy.
- [`docs/hexy/dashboard.md`](hexy/dashboard.md) — el dashboard como herramienta de modelado de sistemas de dominio.
- [`README.md`](../README.md) — visión general del repo Hexy.
- `../sol/README.md` — el lenguaje SOL.
