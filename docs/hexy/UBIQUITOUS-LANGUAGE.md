# Ubiquitous Language — Canonical Reference (SOL ↔ Hexy)

> **Fuente de verdad única del vocabulario del framework.** Cuando SOL (el lenguaje) y
> Hexy (el harness) discrepen sobre un nombre, **manda SOL**. Este documento existe porque
> el diferenciador del proyecto —referencias semánticas anti-alucinación— se contradice a
> sí mismo si los dos repos llaman distinto a la misma cosa.
>
> Estado: `draft` · Última actualización: 2026-06-17 · Ver [POSITIONING](../POSITIONING.md).

---

## Por qué este documento es bloqueante

Un *Domain-Driven AI Framework* vende **un solo Ubiquitous Language**. Si `Intent` en SOL
es `Purpose` en Hexy, un agente que lea ambos repos ve dos términos para un concepto y
**alucina la diferencia** — exactamente lo que el framework promete evitar. Unificar el
vocabulario no es cosmético: es el cumplimiento de la promesa central.

---

## Decisión canónica: `Intent` (no `Purpose`)

- **SOL** define el bloque fundacional como **`Intent`** (con `statement`, `mode` ∈
  {declare, require, propose, prohibit}, `priority`). Es la fuente.
- **Hexy** ya lo nombra **`Intent`** en `shared/types/Artifact.ts`
  (`ARTIFACT_TYPES.INTENT`) y en el dashboard.

**Resolución:** el término canónico es **`Intent`**. El antiguo `Purpose` sobrevive sólo
como **alias legacy de retrocompatibilidad** para datos persistidos: ver
`LEGACY_ARTIFACT_TYPE_ALIASES` / `normalizeArtifactType` en `shared/types/Artifact.ts`,
que migra `'purpose' → 'intent'` al leer del almacenamiento.

> ✅ **Acción de código completada:** `ARTIFACT_TYPES.PURPOSE → INTENT` (y la interfaz
> `Purpose → Intent`) renombrados en `shared/types/Artifact.ts`, propagados al `dashboard/`
> y a `ExecutionContext` (campo `purpose → intent`). El string legacy `'purpose'` se
> normaliza en carga para no romper datos existentes.

El resto del vocabulario fundacional **ya coincide**: `Context`, `Authority`, `Evaluation`.

---

## Los 17 artefactos (taxonomía unificada)

SOL anuncia "20 artefactos" pero cuenta 3 archivos de documentación; los **tipos reales son
17** y **coinciden 1:1 con `ARTIFACT_TYPES` de Hexy**, salvo Intent/Purpose.

### 🧠 Fundacionales (4) — bloques reutilizables vía `uses:`
| Canónico (SOL) | Hexy (`ARTIFACT_TYPES`) | Rol | Anti-alucinación |
|---|---|---|---|
| **Intent** | `INTENT` (legacy `purpose` se auto-migra) | Voluntad/propósito declarado | fuente de verdad de la intención |
| **Context** | `CONTEXT` | Ámbito, condiciones, frontera | define el **bounded context** |
| **Authority** | `AUTHORITY` | Legitimidad/mandato de la decisión | ancla la decisión a un actor real |
| **Evaluation** | `EVALUATION` | Criterios de éxito | hace verificable el resultado |

### 🏗️ Estratégicos / Normativos (6)
| Canónico | Hexy | Compone (`uses:`) |
|---|---|---|
| **Vision** | `VISION` | Intent + Context + Authority + Evaluation |
| **Policy** | `POLICY` | Intent + Context + Authority + Evaluation |
| **Concept** | `CONCEPT` | Intent + Context + Authority |
| **Principle** | `PRINCIPLE` | Intent + Authority |
| **Guideline** | `GUIDELINE` | Intent + Authority |
| **Indicator** | `INDICATOR` | Intent + Context + Authority + Evaluation |

### ⚡ Operativos / de Flujo (5)
| Canónico | Hexy | Aporta |
|---|---|---|
| **Process** | `PROCESS` | flujo semántico `Actor → "acción"` |
| **Procedure** | `PROCEDURE` | coreografía detallada paso a paso |
| **Event** | `EVENT` | suceso observable; **único canal cross-area** |
| **Observation** | `OBSERVATION` | captura perceptual / telemetría |
| **Result** | `RESULT` | estado final o decisión emergente |

### 🏢 Organizacionales (2)
| Canónico | Hexy | Rol |
|---|---|---|
| **Actor** | `ACTOR` | sujeto que ejecuta acciones |
| **Area** | `AREA` | dominio organizacional = **bounded context** |

---

## Referencias semánticas (la regla anti-alucinación)

Sintaxis canónica: **`ArtifactType:ArtifactId`** (p. ej. `Authority:ConsejoDirectivo`,
`Area:Tecnologia.Desarrollo`, `Indicator:ParticipacionMercado`).

| ✅ Permitido | ❌ Prohibido |
|---|---|
| Referencia tipada a artefacto existente (`Actor:X`) | String genérico (`"[ResponsibleActorId]"`) |
| Misma área o área superior | Cross-area directa (debe ir vía `Event`) |
| Composición vía `uses:` | Duplicar bloques fundacionales (herencia) |
| Flujo `Actor:Rol → "acción"` con I/O tipado | `action: "texto"` sin actor semántico |

Detalle completo: `../sol/docs/templates/SEMANTIC_REFERENCE_RULES.md`.

---

## Relaciones tipadas entre artefactos (Hexy)

`shared/types/Artifact.ts` define 10 tipos de relación que materializan el grafo:

`DEPENDS_ON` · `IMPLEMENTS` · `INFLUENCES` · `CONTAINS` · `REFERENCES` · `SUPPORTS` ·
`CONFLICTS_WITH` · `EVOLVES_TO` · `VALIDATES` · `DERIVES_FROM`

Cada relación lleva `confidence`, `weight`, `semanticStrength` y `validationStatus`
(`valid|warning|error|pending`) — base del **eval gate** semántico.

---

## Términos de la capa de ejecución (Hexy)

Estos **no** son artefactos de dominio; son el vocabulario del *harness* (ver
[POSITIONING §3](../POSITIONING.md#3-glosario-híbrido-ubiquitous-language--industria)).

| Término | Definición | Archivo |
|---|---|---|
| **ExecutionContext** | Traza inmutable: actor, purpose/intent, inputs, events, observations, violations | `shared/types/ExecutionContext.ts` |
| **HarnessRuntime** | Entorno que corre el loop con guardrails (a implementar) | `docs/hexy/harness-runtime.md` |
| **el loop** | act → observe → validate → decide → repeat (con término) | ídem |
| **Context Orchestration** | cache → memory → select → compress → explain | `core/hexy-context-orchestrator.py` |
| **Violation** | incumplimiento de regla de artefacto = guardrail breach | `shared/types/ExecutionContext.ts` |
| **Observation** | punto de telemetría del loop | ídem |
| **EventBus** | pub/sub de DomainEvents | `shared/events/EventBus.ts` |

---

## Reglas de uso de este documento

1. **SOL es la fuente.** Ante divergencia de nombres, prevalece SOL.
2. **Un término, una definición.** No introducir sinónimos; enlazar aquí.
3. **`Intent`, no `Purpose`,** en toda documentación nueva.
4. **Inglés para nombres de artefacto y términos técnicos; español para prosa** (ver
   convención en [POSITIONING](../POSITIONING.md#convención-de-idioma)).
5. Cambios al vocabulario se hacen **aquí primero**, luego se propagan a SOL y Hexy.
