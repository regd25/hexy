# 📁 Project Structure in Hexy

Hexy follows a Context-based and Hexagonal Architecture. The base structure looks like this:

```
/src
  └── context/
        └── <context-name>/
              ├── application/
              │     ├── use-case/
              │     ├── service/
              │     └── event-handler/
              ├── domain/
              │     ├── aggregate/
              │     ├── value-object/
              │     ├── port/
              │     └── specification/
              ├── infrastructure/
              │     ├── adapter/
              │     │     └── (optional: by technology or concern)
              │     └── config/
              └── module.ts
  /shared
    ├── dto/
    │    └── v1/
    ├── events/
    │    └── <context>/
    └── utils/
```

---

## 📌 Key Conventions

- Each context defines a business boundary with independent logic.
- **UseCases** are the entry point to business operations.
- **Services** encapsulate domain logic.
- **Aggregates**, **Value Objects**, and **Specifications** define the structure and rules of the domain.
- **Ports** are interfaces that the domain depends on.
- **Adapters** implement those ports to interact with external infrastructure.
- **Event Handlers** react to domain events.
- **module.ts** bootstraps all dependencies and bindings.

---

## 🧱 Recommendations

- Each file should be clearly named: `generate-invoice.usecase.ts`, `invoice.aggregate.ts`, etc.
- If you have many adapters of the same type, you may group them by tech or concern (`adapter/email/`, `adapter/postgres/`).
- Do not share entities or services between contexts. Use versioned DTOs under `/shared`.

---

### ✅ To create your first context:
```bash
hexy create context billing
```

This will scaffold the base structure under `/context/billing/`.
