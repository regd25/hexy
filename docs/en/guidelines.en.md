### Development Flow Guide in Hexy

Hexy is based on Domain-Driven Design and Hexagonal Architecture. This guide outlines the primary application flow, from input to side-effect execution.

---

### 🔁 General Flow

```plaintext
Client → Controller → UseCase (run) → Service → Repository → Aggregate → Event → EventHandler
```

---

### 📁 Project Structure

Hexy follows a Context-based and Hexagonal Architecture. The base structure looks like this:

```
/src
  └── context/
        └── <context-name>/
              ├── use-case/
              ├── service/
              └── event-handler/
              ├── aggregate/
              ├── value-object/
              ├── port/
              └── specification/
              ├── adapter/
              │     └── (optional: by technology or concern)
              └── config/
              └── module.ts
  /shared
    ├── dto/
    │    └── v1/
    ├── events/
    │    └── <context>/
    └── utils/
```

---

### 📌 Key Conventions

- Each context defines a business boundary with independent logic.
- **UseCases** are the entry point to business operations.
- **Services** encapsulate domain logic.
- **Aggregates**, **Value Objects**, and **Specifications** define the structure and rules of the domain.
- **Ports** are interfaces that the domain depends on.
- **Adapters** implement those ports to interact with external infrastructure.
- **Event Handlers** react to domain events.
- **module.ts** bootstraps all dependencies and bindings.

---

### 🧱 Recommendations

- Each file should be clearly named: `generate-invoice.usecase.ts`, `invoice.aggregate.ts`, etc.
- If you have many adapters of the same type, you may group them by tech or concern (`adapter/email/`, `adapter/postgres/`).
- Do not share entities or services between contexts. Use versioned DTOs under `/shared`.

---

### ✅ To create your first context:
```bash
hexy create context billing
```

This will scaffold the base structure under `/context/billing/`.

---

### 🎯 System Inputs

- HTTP (via Controller)
- WebSocket (via `@WebSocketHandler`)
- Messaging / Events (via `@EventHandler`)
- Scheduled tasks or Pollers (coming soon)

---

### ⚙️ Layers and Responsibilities

- **Controller**: adapts HTTP input to DTOs, delegates to UseCase
- **WebSocketHandler**: handles socket events and calls UseCases
- **UseCase**: orchestrates services, may emit events
- **Service**: contains specific business rules
- **Repository**: provides data access through ports
- **Aggregate**: consistency model that validates and encapsulates state
- **EventHandler**: executes side effects in response to events

---

### 🧩 Required Decorators

- `@Controller`, `@WebSocketHandler`, `@UseCase`, `@Service`, `@Aggregate`, `@EventHandler`, `@DomainEvent`
- All must include `context` at minimum for traceability and documentation

---

### 🧪 Testing

- **Controller** → HTTP tests or mocks (`supertest`)
- **WebSocketHandler** → simulate socket and payload
- **UseCase** → unit test with service/repo/eventBus mocks
- **Service** → test business logic in isolation
- **Aggregate** → validate consistency and `toPrimitive`
- **EventHandler** → test like a UseCase (event as input)
- **Repository (abstract)** → mocked in service tests
- **Adapter** → integration tests

---

### 🧠 Visualization

Hexy can scan decorators and generate:

- Execution flow diagrams
- Event maps
- Port-adapter diagrams
- Contextual relationship maps

---

This guide should be referenced when initiating each module or context.
