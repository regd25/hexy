### Development Flow Guide in Hexy

Hexy is based on Domain-Driven Design and Hexagonal Architecture. This guide outlines the primary application flow, from input to side-effect execution.

---

### 🔁 General Flow

```plaintext
Client → Controller → UseCase (run) → Service → Repository → Aggregate → Event → EventHandler
```

---

### 🧱 Structure by Context

- `application/` → Orchestration and use cases
- `domain/` → Domain model, rules, contracts
- `infrastructure/` → Adapters to databases, events, external APIs

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
