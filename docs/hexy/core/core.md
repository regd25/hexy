### Inference-First: cómo **deducir automáticamente** el `type` de un link

*(paso a paso, listo para implementar en Hexy)*

---

#### 1. Pipeline propuesto

```mermaid
flowchart LR
  A[Artefact A (text + metadata)]
  B[Artefact B (text + metadata)]
  A -->|describe| P[Pre-procesamiento NLP]
  B -->|describe| P
  P --> R[Reglas & Patrón léxico]
  P --> E[Embeddings/Similitud]
  P --> L[LLM Classifier]
  R --> C[Consensus Engine]
  E --> C
  L --> C
  C --> O[Suggest { type, confidence }]
```

| Fase                  | Qué hace                                                              | Tecnologías/código sugerido                                 |
| --------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Pre-procesamiento** | Normaliza texto, extrae POS & dependencias                            | `compromise` o `spaCy` (Node bindings)                      |
| **Reglas léxicas**    | Match de verbos/frases (“contains”, “implements”, “measures…”) → tipo | Yaml/JSON de patrones + `regexp`                            |
| **Embeddings**        | Vectoriza descripciones y compara vs. *prototypes* de cada tipo       | `@pinecone-database/vecs` + OpenAI `text-embedding-3-small` |
| **LLM Classifier**    | Prompt few-shot: devuelve `LinkType` + score                          | OpenAI function-call (cheap, 1-2 ¢)                         |
| **Consensus Engine**  | Pondera: Regla > Similitud > LLM  (votos + umbral)                    | simple TS función                                           |

---

#### 2. Patrón léxico mínimo viable

```yaml
composition:
  - /\b(part\w* of|composed of|contains)\b/i
implementation:
  - /\b(implements?|enforces?|realizes?)\b/i
measurement:
  - /\b(measures?|kpi|indicator|monitors?)\b/i
flow:
  - /\b(next step|after|then|workflow)\b/i
event:
  - /\b(emits?|publishes?|subscribes?|trigger[ed]?|on\s+\w+ed)\b/i
dependency:
  - /\b(uses?|depends? on|requires?)\b/i
```

> **Tip:** guárdalo en `config/link-patterns.yml`; editable por el usuario.

---

#### 3. Embedding + prototipo

```ts
// prototypes.ts
export const prototypes = {
  composition:   "Entity A is part of Entity B. Removing A breaks B.",
  implementation:"Service A executes Policy/Rule B.",
  measurement:   "Indicator B measures process/outcome of A.",
  flow:          "Step A happens then Step B in a workflow.",
  event:         "Event A is published and B subscribes.",
  dependency:    "A calls or uses data from B."
};
```

Compute cosine similarity of *(descA + descB)* vs. each prototype → top hit.

---

#### 4. LLM few-shot prompt (example)

```json
{
  "role": "system",
  "content": "You classify the semantic relationship type..."
},
{
  "role": "user",
  "content": "A: 'Aggregate Invoice contains multiple LineItems.' B: 'Entity LineItem...' Which link type?"
},
{
  "role": "assistant",
  "content": "composition"
},
{ /* …otro ejemplo… */ },
{
  "role": "user",
  "content": "A: 'Process HiringPipeline is assessed by the KPI Time-to-Hire.' B: 'Indicator Time-to-Hire...' "
}
```

Return JSON `{type:"measurement", confidence:0.94}` (define as function call).

---

#### 5. Código skeleton

```ts
import {matchLinkTypeByRules} from './rules';
import {similarityType}       from './embeddings';
import {classifyWithLLM}      from './llm';

export async function inferLinkType(a: Artefact, b: Artefact): Promise<{type: LinkType, confidence:number}> {
  const candidates: Record<LinkType, number> = {};

  // 1. reglas
  const rule = matchLinkTypeByRules(a, b);
  if (rule) candidates[rule] = 0.9;

  // 2. embeddings
  const sim = await similarityType(a, b);
  candidates[sim.type] = Math.max(candidates[sim.type] ?? 0, sim.score);

  // 3. LLM (sólo si empatado o <0.8)
  const top = Object.entries(candidates).sort(([,s1],[,s2])=>s2-s1)[0];
  if (!top || top[1] < 0.8) {
    const llm = await classifyWithLLM(a, b);
    candidates[llm.type] = llm.confidence;
  }

  // 4. consenso
  const [type, confidence] = Object.entries(candidates).sort(([,s1],[,s2])=>s2-s1)[0];
  return {type: type as LinkType, confidence};
}
```

---

#### 6. UI/UX

* **Auto-suggest:** al crear link, Canvas pre-selecciona `type` + muestra badge de confianza (p.e. 82 %).
* **Override fácil:** usuario puede cambiarlo; acción dispara feedback para afinar reglas (active learning).
* **Highlight low-confidence (<70 %)** para revisión manual.

---

#### 7. Roadmap incremental

| Sprint  | Entregable                                             | Complejidad   |
| ------- | ------------------------------------------------------ | ------------- |
| **S-1** | Reglas léxicas + menú override                         | 🟢 bajo       |
| **S-2** | Embeddings + prototipos                                | 🟡 medio      |
| **S-3** | LLM fallback + active-learning log                     | 🟠 medio-alto |
| **S-4** | Consensus tuning, dashboard de precisión, auto-retrain | 🔴 alto       |

---

### ¿Te gustaría arrancar con el **patrón léxico (S-1)** o montamos directo el embedding prototype (S-2)?
