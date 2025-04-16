### Aggregates

- Location: `/context/<context>/aggregate/`
- An Aggregate represents a transactional consistency boundary in the domain.
- Must extend from `AggregateRoot`.
- Should be decorated with `@Aggregate({ ... })` to register its context, emitted events, and commands.
- Encapsulates internal entities and invariants that can only be modified from the root.

---

### 🧱 Structure

- All internal fields must be `private` or `protected`.
- Only intention-revealing methods should be exposed.
- Public getters are only allowed for simple reads.
- Must implement `toPrimitive()` to return safe data representations.
- Must be constructed using Value Objects — never raw primitives.
- Should not be used directly in external layers — only via UseCases or Services.

---

### 🧩 Decorator fields for `@Aggregate({ ... })`

- `context`: (string) required – the business context name.
- `events`: (EventClass[]) list of events emitted by the aggregate.
- `commandHandlers`: (InjectionToken[]) list of commands this aggregate can handle.
- `description`: (string) optional – explanatory text for documentation.
- `version`: (string) optional – defaults to 'v1'.
- `name`: (string) optional – defaults to the class name.

> ⚠️ **`commandHandlers` must be declared using `InjectionToken`s defined within the same context or in `/shared`. They must never be imported from another context to preserve domain independence.**

---

### 🧩 Example
```ts
import { Aggregate } from '@/core/metadata'
import { InvoiceCreated, InvoicePaid } from '../event'
import { COMMANDS } from '../core/command.tokens'

@Aggregate({
  context: 'Billing',
  version: 'v1',
  events: [InvoiceCreated, InvoicePaid],
  commandHandlers: [COMMANDS.GenerateInvoice, COMMANDS.MarkInvoiceAsPaid],
  description: 'Aggregate representing an invoice and its payments'
})
export class Invoice extends AggregateRoot {
  constructor(
    private readonly id: InvoiceId,
    private readonly amount: Money,
    private readonly date: InvoiceDate
  ) {
    super();
  }

  get total(): number {
    return this.amount.toNumber();
  }

  toPrimitive() {
    return {
      id: this.id.value,
      amount: this.amount.toNumber(),
      date: this.date.toISO()
    }
  }
}
```
