### Value Objects

- Location: `/context/<context>/value-object/`
- Represent domain concepts without identity.
- Immutable, comparable by value, and encapsulate business logic.
- Should be decorated with `@ValueObject({ ... })` to support tooling and introspection.

---

### 🧱 Structure Guidelines

- Should be `readonly` or `private`, no setters.
- Must validate on construction or by extending `ValueObject<T>`.
- Compare via `equals()` or custom logic.
- Implement `toPrimitive()` to expose raw value.

---

### 🧪 Testing

- Test file: `<name>.spec.ts`
- Recommended location: same folder or `__tests__/`
- Example: `username.spec.ts`

---

### 🧩 `@ValueObject({ ... })` Decorator

- `context`: (string) required — the bounded context this VO belongs to.
- `name`: (string) optional — defaults to class name.
- `description`: (string) optional — useful for documentation.
- `primitive`: (string) optional — e.g., `string`, `number`, `Date`, etc.

---

### 🧩 Example
```ts
@ValueObject({
  context: 'User',
  description: 'Non-empty username',
  primitive: 'string'
})
export class Username extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value.trim()) {
      throw new Error('Username cannot be empty');
    }
  }
}
```

---

### 🧠 Best practices

- Never accept or return raw strings without validation.
- Always explicitly constructed from UseCases or Services.
- Ideal to encapsulate business rules (e.g., `Money`, `Username`, `Coordinates`, etc.).
