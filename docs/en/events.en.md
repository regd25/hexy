### Domain Events

- Location: `/context/<context>/event/`
- Immutable classes representing business facts.
- Must extend `DomainEvent` and be decorated with `@DomainEvent({ ... })`

---

### 🧱 Rules

- Immutable, read-only only.
- Constructor defines all fields.
- Expose a `toPrimitive()` method for serialization.

---

### 🧩 `@DomainEvent({ ... })` Decorator

- Fields:
  - `context`: required
  - `version`: optional, defaults to `'v1'`
  - `description`: optional

---

### 🧩 Example
```ts
@DomainEvent({ context: 'User', description: 'Event triggered when a user registers' })
export class UserRegistered extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super()
  }

  toPrimitive() {
    return {
      userId: this.userId,
      email: this.email
    }
  }
}
```

---

### Event Handlers

- Location: `/context/<context>/event-handler/`
- React to domain events by executing side effects.
- Must extend from `EventHandler<Event>` and be decorated with `@EventHandler(...)`

---

### 🧱 Structure Rules

- Do not return values, only produce side effects.
- Must only depend on domain services (no direct infra access).
- Prefer one handler per event.

---

### 🧪 Testing

- File: `<name>.event-handler.spec.ts`
- Location: same folder or `__tests__/`
- Should simulate the event and verify its effect

---

### 🧩 `@EventHandler({ ... })` Decorator

- Fields:
  - `event`: event class handled
  - `traceable`: optional for telemetry
  - `description`: optional

---

### 🧩 Example
```ts
@EventHandler({ event: UserRegistered, traceable: true })
export class SendWelcomeEmail extends EventHandler<UserRegistered> {
  constructor(private readonly mailer: MailerService) {
    super()
  }

  async execute(event: UserRegistered): Promise<void> {
    await this.mailer.send({
      to: event.email,
      subject: 'Welcome!',
      body: 'Thanks for registering'
    })
  }
}
```