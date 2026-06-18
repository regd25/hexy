# Hexy Dashboard — Systems Modeling Tool

> El dashboard de Hexy es la **superficie de modelado** de la capa de lenguaje (SOL): se
> modela el dominio como un **grafo de artefactos tipados** con **validación semántica en
> vivo**, y ese modelo alimenta dos consumidores a través del *harness*: (A) el desarrollo
> de **sistemas de código basados en dominio** y (B) la **ejecución de flujos de negocio**.
>
> Estado: `draft` · Última actualización: 2026-06-17 · Ver [POSITIONING](../POSITIONING.md)
> y [UBIQUITOUS-LANGUAGE](UBIQUITOUS-LANGUAGE.md).

---

## 1. Qué es

El dashboard (`dashboard/`, React 19 + D3 + Zod + Zustand) es una herramienta de **modelado
de sistemas de dominio**. No es un editor de texto de artefactos: es un **lienzo semántico**
donde se construye el modelo de una organización o sistema como **artefactos** (Intent,
Context, Authority, Evaluation, Process, Policy, Actor, Area, …) conectados por
**relaciones tipadas**, con **validación semántica en tiempo real** que actúa como
*eval gate*.

Donde un diagrama tradicional (UML, BPMN, cajas en una pizarra) produce un dibujo
**inerte**, el dashboard produce un **modelo ejecutable y verificable**: cada artefacto y
cada referencia están tipados, validados y listos para alimentar el harness de Hexy.

```
   Pizarra / UML / BPMN              Hexy Dashboard
   ─────────────────────            ──────────────────────────────
   dibujo inerte                →   modelo tipado + validado
   strings ambiguos             →   referencias semánticas (Actor:X)
   sin ejecución                →   alimenta el loop del harness
```

---

## 2. Dónde encaja: las dos capas

El dashboard es la **autoría** de la capa de lenguaje; el harness es la **ejecución**.

```
┌──────────────────────────────────────────────────────────────┐
│  AUTORÍA          Hexy Dashboard (este documento)            │
│                   modelar el dominio como grafo de artefactos │
└───────────────────────────┬──────────────────────────────────┘
                            │  exporta / sincroniza
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  LENGUAJE         SOL — artefactos .sop (Ubiquitous Language)│
│                   referencias semánticas anti-alucinación     │
└───────────────────────────┬──────────────────────────────────┘
                            │  contrato SOL→Hexy (parse→resolve→…)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  EJECUCIÓN        Hexy HarnessRuntime — el loop               │
│                   ┌────────────────────┬───────────────────┐  │
│                   ▼                    ▼                   │  │
│        A) Domain-driven code     B) Business-flow execution│  │
└──────────────────────────────────────────────────────────────┘
```

Ver el contrato de integración en [`harness-runtime.md`](harness-runtime.md) §4.

---

## 3. Anatomía (qué hay dentro)

### Vista
`ArtifactsDashboard` (`dashboard/artifacts/components/ArtifactsDashboard.tsx`) compone:
- **`ArtifactList`** — navegación/filtrado de artefactos del modelo.
- **`GraphContainer` → `GraphCanvas` + `ArtifactNode`/`GraphNode`** — grafo *force-directed*
  D3 de artefactos y relaciones; arrastre, zoom y selección.
- **`SemanticArtifactEditor`**, **`ContextMenu`**, editores inline/flotantes
  (`shared/editors/`) y `AutocompleteDropdown` para referencias.

### Modelo
**`VisualArtifact`** (`dashboard/artifacts/types/VisualArtifact.ts`) extiende el `Artifact`
del Single Source of Truth (`shared/types/Artifact.ts`) y añade:
- Campos de dominio: `intent`, `context`, `authority`, `evaluationCriteria`.
- `semanticMetadata`: `businessValue`, `stakeholders`, `semanticWeight`,
  `contextualRelevance`, `temporalRelevance`.
- `visualProperties` + `coordinates` (render D3), `relationships`, `isValid`,
  `validationErrors`.
- **Schemas Zod** (`visualArtifactSchema`, `relationSchema`, …) para validación de tipos en
  runtime.

> ℹ️ El campo `VisualArtifact.purpose` es texto libre de *intención* y conserva el nombre
> legacy `purpose`; el **tipo de artefacto** fundacional es `Intent` (ver
> [UBIQUITOUS-LANGUAGE](UBIQUITOUS-LANGUAGE.md#decisión-canónica-intent-no-purpose)).

### Validación como *eval gate* en vivo
**`ValidationService`** (`dashboard/artifacts/services/ValidationService.ts`) ejecuta, a
medida que se modela:
- **Reglas semánticas:** alineación **intent ↔ context**, **legitimidad de authority**,
  **coherencia de evaluation**.
- **Business rules** con `severity: error | warning`.
- Devuelve `ValidationResult` con `errors`, `warnings`, `suggestions` y `semanticScore`.

Esto es el equivalente, en la mesa de modelado, del *eval gate* del harness: el modelo no
"compila" hasta que es semánticamente coherente.

### Arquitectura
- **Event-driven:** `dashboard/shared/event-bus/InMemoryEventBus.tsx` (pub/sub de DomainEvents).
- **Servicios:** `ArtifactService`, `ArtifactRepository`, `GraphService`, `EditorService`.
- **Hooks:** `useArtifactEditor`, `useArtifactValidation`, `useGraphInteractions`,
  `useTemporalArtifacts`.
- Tipos derivados del SSOT compartido (`shared/`) → mismo vocabulario que el harness.

---

## 4. Flujo de modelado

1. **Crear bloques fundacionales** — `Intent`, `Context`, `Authority`, `Evaluation`
   (reutilizables vía composición `uses:`).
2. **Componer artefactos** — `Vision`, `Policy`, `Process`, `Indicator`, … referencian los
   fundacionales en vez de duplicarlos (principio DRY).
3. **Relacionar** — conectar nodos con uno de los 10 `RelationType` (`DEPENDS_ON`,
   `IMPLEMENTS`, `INFLUENCES`, `CONTAINS`, `SUPPORTS`, `CONFLICTS_WITH`, `EVOLVES_TO`,
   `VALIDATES`, `DERIVES_FROM`, `REFERENCES`), cada uno con `confidence`/`weight`/
   `semanticStrength`.
4. **Validar** — el `ValidationService` marca incoherencias en vivo; las referencias usan la
   sintaxis tipada `Type:Id`, no strings genéricos (regla anti-alucinación de SOL — ver
   `../sol/docs/templates/SEMANTIC_REFERENCE_RULES.md`).

El resultado es un **grafo de dominio validado**: la entrada de los dos caminos siguientes.

---

## 5. Camino A — Sistemas de código basados en dominio  🌟 *vision/design*

El grafo validado **es el domain model**, no un boceto previo a él:

- **`Area` = bounded context**; los artefactos = el **Ubiquitous Language** del sistema.
- Se exporta a **SOL `.sop`** (specs-as-code versionadas).
- El **harness de Hexy** dirige el *scaffolding* / generación de código **anclado en
  referencias verificadas**: como cada `Actor:X`, `Process:Y` resuelve contra el modelo (el
  contrato Resolve de [`harness-runtime.md`](harness-runtime.md) §4 falla si no existe), el
  agente **no puede inventar** entidades de dominio. Es anti-alucinación *por construcción*,
  no por buena suerte.

> En términos de 2026: el modelo del dashboard es la **fuente de verdad** que se inyecta al
> context window del agente codificador; los bounded contexts (`Area`) son sus *guardrails*.

**Hoy:** no hay generador de código implementado. Este camino es **diseño**; depende del
export a `.sop` y del `HarnessRuntime` mínimo.

---

## 6. Camino B — Ejecución de otros flujos de negocio  🌟 *vision/design*

El **mismo** modelo, cuando contiene artefactos operativos (`Process`, `Procedure`,
`Event`), se ejecuta como **flujo de negocio** — sin generar código:

- El `Process.flow` (notación `Actor:Rol → "acción"`) se proyecta a `Step[]`; las `Policy`
  a `Guardrail[]`; `Intent` + `Evaluation` definen meta y condición de término.
- El **`HarnessRuntime`** corre el loop en sus dos modos:
  - **Orquestador** — ejecuta el proceso paso a paso, evaluando condiciones.
  - **Reactivo** — escucha `Event` y valida si cada acción es coherente/permitida.
- Las acciones se ejecutan como **tools** vía **MCP** (prioritario), Jira, n8n, AWS Step
  Functions; toda la corrida deja **traza inmutable** en `ExecutionContext`
  (events/observations/violations).

Es orquestación **operativa**: documentar, validar y ejecutar procesos de negocio reales con
guardrails de dominio y auditoría completa — distinto del Camino A (que produce software).

**Hoy:** el `HarnessRuntime` está en diseño ([`harness-runtime.md`](harness-runtime.md)); el
modelado de `Process`/`Event` en el dashboard existe, la ejecución no.

---

## 7. Estado actual (honesto)

| Capacidad | Estado | Nota / evidencia |
|---|---|---|
| Modelado visual del grafo de artefactos | 🟡 Parcial | arquitectura ~100%, features ~25% |
| Validación semántica en vivo (eval gate) | ✅ Implementado | `dashboard/artifacts/services/ValidationService.ts` |
| Modelo `VisualArtifact` + schemas Zod | ✅ Implementado | `dashboard/artifacts/types/VisualArtifact.ts` |
| Relaciones tipadas (10 tipos) | ✅ Implementado | `shared/types/Artifact.ts` |
| Arquitectura event-driven + servicios | ✅ Implementado | `dashboard/shared/event-bus/`, `dashboard/artifacts/services/` |
| Export del modelo a SOL `.sop` | 🔴 No implementado | requisito de ambos caminos |
| **Camino A** — codegen de dominio | 🌟 Visión / diseño | depende de export + HarnessRuntime |
| **Camino B** — ejecución de flujos | 🌟 Visión / diseño | depende del HarnessRuntime |
| Persistencia del modelo | 🔴 No implementado | hoy in-memory (`InMemoryEventBus`) |

---

## 8. Documentos relacionados

- [`docs/POSITIONING.md`](../POSITIONING.md) — posicionamiento de dos capas y mapeo 2026.
- [`docs/hexy/UBIQUITOUS-LANGUAGE.md`](UBIQUITOUS-LANGUAGE.md) — vocabulario canónico.
- [`docs/hexy/harness-runtime.md`](harness-runtime.md) — el loop y el contrato SOL→Hexy
  (consumidor de los modelos que produce el dashboard).
- `../sol/docs/templates/SEMANTIC_REFERENCE_RULES.md` — reglas anti-alucinación de referencias.
