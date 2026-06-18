# HarnessRuntime — Design Spec (the loop) + SOL→Hexy contract

> **Diseño, no implementación.** Especifica (a) el `HarnessRuntime` mínimo que cierra el
> "hueco del loop" y (b) el contrato por el cual un artefacto SOL `.sop` se carga, valida y
> ejecuta en Hexy. Construye sobre lo que **ya existe** en el repo.
>
> Estado: `draft` · Última actualización: 2026-06-17 · Ver [POSITIONING §5.3](../POSITIONING.md#53-estado-del-arte--cerrar-el-hueco-del-loop).

---

## 1. El problema: el loop se modela pero no se corre

Hoy `shared/types/ExecutionContext.ts` ofrece una **traza inmutable** con helpers
(`createExecutionContext`, `withEvent`, `withObservation`, `withViolation`), pero **nadie
la avanza**: no hay un componente que tome una acción, observe el entorno, valide contra
los artefactos y decida el siguiente paso. Eso es justo lo que la industria 2026 llama
**loop engineering**. `HarnessRuntime` es ese componente faltante.

---

## 2. El loop, en términos del repo

```
                    ┌───────────────────────────────────────────┐
                    │  goal := Intent + Evaluation (criterio     │
                    │          de término) del artefacto SOL     │
                    └───────────────────┬───────────────────────┘
                                        ▼
   ┌────────►  ACT      el agente/proceso ejecuta un step
   │            │       (Process.flow → tool call vía MCP)
   │            ▼
   │          OBSERVE   resultado del tool → withObservation(ctx, …)
   │            │
   │            ▼
   │          VALIDATE  ValidationService + SOL validator:
   │            │       ¿coherente con Policy/Authority/refs?
   │            │       incumplimiento → withViolation(ctx, …)
   │            ▼
   │          DECIDE    ¿Evaluation satisfecha? ¿violation fatal?
   │            │       ¿presupuesto agotado? → término o siguiente step
   └────────────┘
                        cada transición: withEvent(ctx, …)  (traza)
```

- **Goal / término:** derivado del `Intent` (qué) y del `Evaluation` (cómo se reconoce el
  éxito) del artefacto SOL en ejecución. **No es un prompt**: es spec versionada.
- **Guardrails:** las `Policy` (`mode: require|prohibit`) y las reglas de `Authority`
  producen **`Violation`** cuando se cruzan. Una violation `error` puede terminar el loop.
- **Feedback verificable:** el `ValidationService` (dashboard) y el **SOL validator**
  (schema + referencias existentes) son señales **deterministas** — el agente no las puede
  "convencer", como exige el patrón de verificación 2026.
- **Traza:** cada vuelta acumula `events/observations/violations` en el `ExecutionContext`
  inmutable → auditoría y observabilidad sin trabajo extra.

---

## 3. Interfaz mínima propuesta (TypeScript, shared/)

```ts
// shared/runtime/HarnessRuntime.ts  (a crear)

export interface TerminationCondition {
  /** Deriva de Evaluation: criterio observable de éxito. */
  isSatisfied(ctx: ExecutionContext): boolean
  /** Tope duro: presupuesto de tokens / nº de steps / tiempo. */
  budgetExhausted(ctx: ExecutionContext): boolean
}

export interface Step {
  /** Un paso del Process.flow: Actor → "acción" con I/O tipado. */
  readonly actor: Actor
  run(ctx: ExecutionContext): Promise<Observation>   // ACT + OBSERVE
}

export interface Guardrail {
  /** Evalúa Policy/Authority/refs sobre la última observación. */
  check(ctx: ExecutionContext): Violation[]           // VALIDATE
}

export interface HarnessRuntime {
  /** Corre el loop hasta término; devuelve la traza final inmutable. */
  run(input: {
    goal: Intent
    termination: TerminationCondition
    steps: Step[]
    guardrails: Guardrail[]
    seed: ExecutionContext
  }): Promise<ExecutionContext>
}
```

Reglas de diseño:
- **Inmutabilidad:** nunca mutar `ctx`; usar los `with*` existentes → cada step produce un
  nuevo `ExecutionContext`.
- **`Violation` severidad `error` = parada** (guardrail breach fatal); `warning`/`info`
  continúan pero quedan en la traza.
- **Presupuesto explícito** en `TerminationCondition.budgetExhausted` — el límite de tokens
  es un ciudadano de primera clase, no un efecto colateral.

---

## 4. Contrato de integración SOL → Hexy

Cómo un artefacto `.sop` llega a ejecutarse. Hoy esto es **prosa**; aquí se vuelve interfaz.

```
  .sop (YAML)
     │  1. PARSE        yaml → objeto; validar contra sol-schema.json
     ▼
  SolArtifact
     │  2. RESOLVE      resolver referencias semánticas (Actor:X, uses:…)
     │                  contra el grafo; fallar si una referencia no existe
     ▼
  ResolvedArtifact  (grafo de artefactos enlazados, sin strings sueltos)
     │  3. PROJECT      proyectar a RDF/OWL (Semantic Engine) para
     │                  razonamiento, SPARQL y presupuesto de tokens
     ▼
  Semantic graph
     │  4. PLAN         Process.flow → Step[];  Policy → Guardrail[];
     │                  Intent+Evaluation → goal + TerminationCondition
     ▼
  HarnessRuntime.run(...)  →  ExecutionContext (traza)
```

Puntos de contrato (cada uno es un punto de fallo explícito, no silencioso):

| Etapa | Entrada | Salida | Falla si… |
|---|---|---|---|
| **Parse** | `.sop` | `SolArtifact` | no valida contra `sol-schema.json` |
| **Resolve** | `SolArtifact` | `ResolvedArtifact` | una referencia `Type:Id` no existe (anti-alucinación) |
| **Project** | `ResolvedArtifact` | grafo RDF | inconsistencia ontológica (reasoner) |
| **Plan** | grafo | `Step[]`/`Guardrail[]`/goal | `Process` sin `flow` o sin `Evaluation` |
| **Run** | plan | `ExecutionContext` | violation fatal o presupuesto agotado |

**La etapa Resolve es el moat operativo:** una referencia que no resuelve **detiene la
ejecución**. El agente no puede "inventar" un actor o un proceso — el harness lo rechaza
antes de correr. Eso es anti-alucinación *forzada por el runtime*, no por buena suerte.

---

## 5. Tools: MCP primero

Las acciones del loop (`Step.run`) deben ejecutarse como **tools**. Recomendación:

- **Priorizar MCP (Model Context Protocol)** como mecanismo de tools/integraciones por
  encima de conectores LLM propietarios (OpenAI/Anthropic SDKs). MCP ya está citado en el
  README de Hexy; convertirlo en el camino por defecto desacopla el harness del proveedor.
- Mapear las integraciones existentes (Jira, n8n, AWS Step Functions) como **servidores
  MCP**, no como adaptadores ad-hoc.
- Anotar cada tool con semántica `readOnly | destructive | idempotent` para que los
  guardrails de `Authority` decidan permisos (base de un futuro **control plane**, PEP/PDP).

---

## 6. Cómputo distribuido: sub-agentes por bounded context

Cuando el loop crezca, **aislar sub-agentes por `Area` SOL** (= bounded context):

- Cada `Area` acota qué artefactos, tools y vocabulario ve un sub-agente → menos tokens,
  menos cross-contamination (patrón de *subagent isolation* 2026).
- La comunicación cross-area respeta la regla SOL: **solo vía `Event`**, nunca referencia
  directa. El `EventBus` (`shared/events/EventBus.ts`) es el transporte natural.
- Topología (secuencial / paralela / jerárquica) se elige por el grafo de dependencias de
  los `Process`, no hardcodeada.

---

## 7. Alcance y no-objetivos

- **En alcance (diseño):** interfaces, contrato de etapas, puntos de fallo, prioridad MCP.
- **Fuera de alcance (este doc):** implementación, elección de modelo, persistencia de la
  traza, scheduler distribuido. Se abordan cuando exista el `HarnessRuntime` mínimo.
- **Dependencia previa:** unificar el Ubiquitous Language
  ([UBIQUITOUS-LANGUAGE.md](UBIQUITOUS-LANGUAGE.md)) — el contrato Resolve asume nombres
  consistentes entre SOL y Hexy.
