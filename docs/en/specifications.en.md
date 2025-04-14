### Specifications

- Location: `/context/<context>/specification/`
- Encapsulate reusable boolean rules for the domain.
- Must not have side effects or access infrastructure.

---

### 🧱 Rules

- Implement `isSatisfiedBy(entity: T): boolean`
- Can be composed with `and`, `or`, `not` if extending `Specification<T>`
- Must be pure, testable, and self-contained

---

### 🧪 Testing

- File: `<name>.spec.ts`
- Recommended location: `__tests__/` or next to implementation
- Should test both satisfying and failing examples

---

### 🧩 `@Specification` Decorator

- Used to register metadata for tooling or docs
- Suggested fields:
  - `context`: (string) required
  - `description`: (string) optional

---

### 🧩 Example
```ts
@Specification({ context: 'User', description: 'Checks if user is active' })
export class IsActive extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.status === 'active'
  }
}
```
