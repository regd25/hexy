### Factories

- Location: `/context/<context>/factory/`
- Encapsulate construction of Aggregates or complex Entities.
- Separate creation logic from constructors.

---

### 🧱 Rules

- Must operate with validated Value Objects or primitives.
- Should never include domain logic.
- Clear naming: `createFromPrimitives`, `createWithDefaults`, `reconstruct`, etc.
- If dependencies are needed, `@Injectable()` is allowed.

---

### 🧪 Testing

- File: `<name>.factory.spec.ts`
- Location: next to implementation or in `__tests__/`

---

### 🧩 `@Factory` Decorator

- Optional: allows metadata registration for tooling.
- Suggested fields:
  - `context`: required
  - `target`: the aggregate or entity it builds
  - `description`: optional

---

### 🧩 Example
```ts
@Factory({
  context: 'User',
  target: User,
  description: 'Builds a user from flat data'
})
export class UserFactory {
  static createFromPrimitives(data: UserDTO): User {
    return new User(
      new UserId(data.id),
      new Email(data.email),
      new Username(data.username)
    )
  }
}
```
