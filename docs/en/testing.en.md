### Testing Strategy in Hexy

Hexy promotes layered testing to ensure stability, traceability, and confidence across the architecture.

---

### 🧪 Types of Tests per Component

#### ✅ Value Objects / Entities
- Pure unit tests
- Equality, validation, toPrimitive()

#### ✅ Aggregates
- Invariant enforcement
- Behavior method testing
- `toPrimitive()` and `applyEvent()` if needed

#### ✅ Services
- Business logic unit tests
- Mock dependencies (repositories, eventBus)

#### ✅ UseCases
- Full orchestration
- Mock services, repos, and eventBus
- Run via `.run(input)` or `.execute(input)`

#### ✅ EventHandlers
- Input = event instance
- Assert side effects
- Must not return values

#### ✅ Factories
- Build aggregates/entities correctly
- Validate input and edge cases

#### ✅ Specifications
- Boolean rules
- `isSatisfiedBy` should return true/false

#### ✅ Repositories (abstract)
- Mocked in UseCases/Services
- Integration via Adapter tests

#### ✅ Adapters
- Real integration tests
- HTTP, S3, DB, WebSocket, Email, etc.

#### ✅ Controllers / WebSocketHandlers
- Simulate HTTP/socket input
- Verify response and that UseCase is invoked

---

### 📁 Standard Location

- Tests live next to the files or under `/__tests__/`
- File name: `<name>.spec.ts` or `<name>.<type>.spec.ts`

---

### 🧩 Recommended Tools

- `jest`, `supertest`, `faker`

---

### 📌 Best Practices

- One test per scenario
- Use controlled mocks, avoid empty ones
- Never mock domain logic
- Separate unit vs integration tests

---

This guideline applies to all Hexy-defined modules.
