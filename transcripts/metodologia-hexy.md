# ⚙️ Metodología de Desarrollo con Hexy

Hexy propone una metodología clara, modular y pragmática. Cada etapa del proceso está pensada para ayudarte a modelar el dominio de manera precisa, desarrollar funcionalidades testeables desde el inicio, y mantener cohesión incluso en arquitecturas distribuidas.

---

## 📍 Etapas del Desarrollo

### 🧩 **Definición Funcional**

> Aquí no hay comandos de Hexy aún. Esta etapa se trabaja con herramientas de diseño, conversaciones, prototipos, Gherkin, etc.

✅ Lo que debes preparar:

- Documento con flujos principales:\
  Ejemplo Gherkin:

```gherkin
Feature: Generar factura

  Scenario: Cliente genera una factura por un pedido
    Given un pedido confirmado con ID 123
    When el usuario confirma la acción "generar factura"
    Then se crea una nueva factura con un ID único
    And se notifica por correo al cliente
```

- Títulos de Casos de Uso, Entidades y Eventos esperados:

  `Casos de uso: generarFactura, enviarFactura Agregado: Invoice Value Objects: Amount, InvoiceDate Eventos: InvoiceGenerated, InvoiceSent`

---

### 2. 📂 Modelado Técnico con CLI de Hexy

#### Comando: `hexy create context`

**Uso:** Crear un nuevo contexto dentro de la aplicación.

**Descripción:** Un contexto representa un "bounded context" dentro del modelo de dominio. Organiza todo el código relacionado con una subárea del sistema.

**Ejemplo:**

```bash
hexy create context billing
```

**Resultado:**

```text
/src/context/billing/
  ├── domain/
  ├── application/
  └── infrastructure/
```

---

#### Comando: `hexy create service`

**Uso:** Crear un servicio dentro de un contexto.

**Descripción:** El servicio es la unidad funcional dentro de un contexto. Puede contener casos de uso, agregados, eventos, etc.

**Ejemplo:**

```bash
hexy create service --context billing --service-name invoice --use-case generateInvoice --use-case sendInvoice
```

**Resultado:**
Crea estructura completa para el servicio `invoice` con casos de uso base definidos.

---

#### Comando: `hexy configure --add aggregate`

**Uso:** Crear un agregado dentro del dominio.

**Descripción:** Un agregado representa una raíz de consistencia en el dominio. Agrupa entidades y objetos de valor bajo una misma invariancia.

**Ejemplo:**

```bash
hexy configure --add aggregate Invoice --context billing --service invoice
```

**Resultado:**
Archivo `invoice.ts` en `domain/aggregate/`, extendiendo de `AggregateRoot`.

---

#### Comando: `hexy configure --add value-object`

**Uso:** Crear un nuevo objeto de valor.

**Descripción:** Los value objects representan conceptos puros e inmutables sin identidad, como cantidades, fechas, correos, etc.

**Ejemplo:**

```bash
hexy configure --add value-object Amount --type decimal
```

**Resultado:**
Archivo `amount-value-object.ts` en `domain/value-objects/`, con validaciones de tipo incluidas.

---

#### Comando: `hexy configure --add repository`

**Uso:** Crear un repositorio abstracto para un agregado.

**Descripción:** Define una interfaz para persistencia del agregado, siguiendo el patrón Repository de DDD.

**Ejemplo:**

```bash
hexy configure --add repository Invoice
```

**Resultado:**

- `InvoiceRepository` en `domain/repository/`
- Implementación base en `infrastructure/repository/`

---

#### Comando: `hexy configure --add event`

**Uso:** Crear un nuevo evento de dominio.

**Descripción:** Los eventos representan hechos inmutables ocurridos en el dominio.

**Ejemplo:**

```bash
hexy configure --add event InvoiceGenerated
```

**Resultado:**
Evento `InvoiceGenerated` en `domain/events/`, registrado para su publicación en EventBus.

---

#### Comando: `hexy configure --add event-handler`

**Uso:** Crear un manejador de eventos.

**Descripción:** Ejecuta una acción en respuesta a un evento de dominio.

**Ejemplo:**

```bash
hexy configure --add event-handler SendInvoiceEmail --on InvoiceGenerated
```

**Resultado:**
Clase decorada como `@EventHandler`, suscrita a `InvoiceGenerated`.

---

#### Comando: `hexy configure --add event-orchestrator`

**Uso:** Crear un orquestador que coordine eventos entre casos de uso.

**Descripción:** Permite coordinar múltiples handlers, flujos complejos, sagas o transacciones distribuidas.

**Ejemplo:**

```bash
hexy configure --add event-orchestrator InvoiceFlow
```

**Resultado:**
Clase orquestadora con suscripción a varios eventos y delegación a comandos/casos de uso.

---

#### Comando: `hexy configure --add language-module`

**Uso:** Crear módulo de procesamiento de lenguaje natural.

**Descripción:** Provee reglas, intenciones y adaptadores para interpretar lenguaje humano.

**Ejemplo:**

```bash
hexy configure --add language-module InvoiceLang
```

**Resultado:**
Carpeta `language/invoice-lang/` con definiciones de intents, entidades y prompts.

---

#### Comando: `hexy configure --add mcp-agent`

**Uso:** Crear agente de control basado en modelo MCP (Modelo Cognitivo).

**Descripción:** El agente puede interactuar con otros componentes y decidir acción sobre eventos complejos o entradas semánticas.

**Ejemplo:**

```bash
hexy configure --add mcp-agent BillingAgent
```

**Resultado:**
Agente creado con su loop de control, lista de acciones y planificador.

---

#### Comando: `hexy configure --add nlp-event-handler`

**Uso:** Crear manejador de eventos disparado por lenguaje natural.

**Descripción:** Actúa ante una intención detectada o un prompt interpretado.

**Ejemplo:**

```bash
hexy configure --add nlp-event-handler InterpretCustomerIntent
```

**Resultado:**
Clase capaz de recibir intents y transformarlos en comandos o eventos del sistema.

---

## ➕ Anexos: Casos de Uso Complejos

A continuación se presentan algunos ejemplos avanzados que demuestran el potencial de Hexy para resolver necesidades reales con arquitecturas modernas, orientadas a eventos, a lenguaje natural y a experiencias real time.

Estos casos pueden servir como inspiración, referencia o punto de partida para proyectos complejos. En todos ellos, se mantiene la separación de capas, el uso de agregados, y la programación basada en casos de uso.

Al finalizar esta guía, el equipo debería estar en capacidad de modelar funcionalidades complejas, construirlas de manera estructurada usando la CLI de Hexy, y mantener la escalabilidad y testabilidad del sistema. Para más detalles o plantillas, se recomienda consultar la documentación oficial o explorar los ejemplos incluidos en el repositorio.

### 1. CRUD de Memorias de Usuario usando Postgres con Embeddings

**Escenario:** Una aplicación que registra las memorias o pensamientos del usuario y permite buscar por similitud semántica utilizando vectores de embeddings almacenados en PostgreSQL.

- **Entidad principal:** `UserMemory` (campos: id, userId, content, embedding, createdAt)
- **Value Object:** `Embedding` encapsula un array de `float64`, validado en rango y dimensión.
- **Repositorio:** `UserMemoryRepository`
  - Métodos: `save`, `findByUser`, `searchBySimilarity(embedding: Embedding): UserMemory[]`
- **Evento:** `UserMemoryCreated`
- **Infraestructura:**
  - PostgreSQL con vector extension (`pgvector`)
  - Comando: `hexy configure --add repository UserMemory`
  - Comando: `hexy configure --add value-object Embedding`
  - Comando: `hexy configure --add event UserMemoryCreated`

### 2. Dashboard de Venta BaF con Widgets Real Time

**Escenario:** Un BaaF expone un dashboard de ventas con múltiples widgets en tiempo real (ventas diarias, productos top, stock crítico).

- **Casos de uso:**
  - `GetDailySalesWidget`
  - `GetTopProductsWidget`
  - `GetLowStockProductsWidget`
- **Orquestador:** `SalesDashboardOrchestrator`
- **Eventos utilizados:**
  - `OrderPlaced`
  - `InventoryUpdated`
- **Infraestructura:**
  - Websocket adapter + Redis pub/sub
  - Comando: `hexy configure --add event-orchestrator SalesDashboardOrchestrator`
  - Comando: `hexy configure --add event OrderPlaced`
  - Comando: `hexy configure --add event InventoryUpdated`

### 3. AI Event Handlers

**Escenario:** El sistema interpreta entradas de lenguaje natural del usuario (por texto o voz) y responde automáticamente ejecutando acciones del dominio.

- **Input:** "Quiero reclamar un pedido que no ha llegado"
- **Interpretación:** Intent `ClaimOrder`
- **Módulo de lenguaje natural:** `ClaimOrderLang`
- **Agente:** `CustomerSupportAgent` basado en MCP
- **Handler:** `InterpretCustomerIntent`
- **Caso de uso activado:** `OpenClaim`
- **Comandos usados:**
  - `hexy configure --add language-module ClaimOrderLang`
  - `hexy configure --add mcp-agent CustomerSupportAgent`
  - `hexy configure --add nlp-event-handler InterpretCustomerIntent`

