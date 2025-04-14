### Decorators and Documentation

Hexy uses decorators as a central source of structured metadata. This enables automatic generation of docs, diagrams, and tooling like Agrovisual.

---

### 🎯 Available Decorators

- `@UseCase({ ... })`
- `@Service({ ... })`
- `@EventHandler({ ... })`
- `@DomainEvent({ ... })`
- `@Aggregate({ ... })`
- `@Repository({ ... })`
- `@Factory({ ... })`
- `@ValueObject({ ... })`
- `@Specification({ ... })`
- `@Port({ ... })`
- `@Adapter({ ... })`
- `@Traceable()`

---

### 🧱 Conventions

- All decorators must include `context` as a required field.
- They must be side-effect free.
- Their only purpose is to register metadata accessible by tooling.

---

### 🧩 Combined Example

```ts
@Traceable()
@UseCase({
  context: 'Billing',
  summary: 'Generates an invoice',
  inputSchema: GenerateInvoiceInput,
  outputSchema: InvoiceDTO
})
export class GenerateInvoiceUseCase extends CommandUseCase<GenerateInvoiceInput, InvoiceDTO> {
  // ...
}
```

---

### 🛠 Automatic Generation

Hexy uses decorators to build:

- UseCase documentation
- Event-aggregate diagrams
- Port-adapter relationships
- Index of ValueObjects, errors, commands, specs

---

### 🧪 Testing

- Decorators should be tested as pure functions.
- Use dummy classes and `Reflect.getMetadata` for assertions.
