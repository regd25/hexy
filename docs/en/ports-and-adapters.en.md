### Ports and Adapters

- Hexy applies the Ports and Adapters (hexagonal) architecture as a core design principle.
- Ports define contracts; adapters implement them.
- Ports go in: `/context/<context>/domain/port/`
- Adapters go in: `/context/<context>/infrastructure/adapter/<type>/`

---

### 🧭 Common Port Types in Hexy

- Repositories → see [repositories.md]
- External adapters → `EmailSender`, `StorageService`, `PaymentGateway`
- Observability → see [observability.md]
- EventBus -> `SnsEventBus`, `SqsEventBus`
- Messaging → `QueueConsumer`, `EventSubscriber`

---

### 🧱 Rules

- Ports are contracts from domain to infra.
- Implementations must not import domain logic.
- Tokens are recommended for DI.

---

### 🧪 Testing

- Integration tests live in the adapter folder.
- Ports are mocked in domain and application tests.

---

### 🧩 `@Port` Decorator

- Optional, used for metadata and classification.
- Fields:
  - `context`: required
  - `description`: optional

---

### 🧩 `@Adapter` Decorator

- Used to document the technology and purpose of an adapter.
- Fields:
  - `technology`: required
  - `for`: the interface or token it implements
  - `description`: optional

---

### 🧩 Example
```ts
@Port({ context: 'User', description: 'Email delivery service' })
export interface EmailSender {
  send(data: { to: string; subject: string; body: string }): Promise<void>
}
```

```ts
@Adapter({ technology: 'Sendgrid', for: EmailSender, description: 'Sendgrid adapter' })
export class SendgridEmailSender implements EmailSender {
  async send(data: { to: string; subject: string; body: string }): Promise<void> {
    // implementation
  }
}
```
