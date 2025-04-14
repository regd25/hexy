### Repositories

- Abstraction in: `/context/<context>/repository/`
- Implementations in: `/context/<context>/adapter/<db>/`

---

### 🧱 Recommended Design

- Extend from `AbstractRepository<T>` for shared base contract.
- Use `DaoRepository<T>` to implement persistence with `toPrimitive`/`fromPrimitives`.
- Decorate implementations with `@Repository({ ... })` to register metadata.
- Always inject via token, never instantiate directly.

---

### 🧪 Testing

- Abstract logic: test in domain `__tests__/` (mocking infra).
- Integration: test in adapter folder: `<tech>-<name>.repository.spec.ts`

---

### 🧩 `@Repository` Decorator

- Used only in the concrete implementation
- Fields:
  - `entity`: the domain class (e.g., `User`)
  - `technology`: persistence layer (`'Postgres'`, `'Mongo'`)
  - `context`: bounded context name
  - `description`: optional for docs

---

### 🧩 Abstraction Example
```ts
export abstract class UserRepository extends AbstractRepository<User> {
  abstract findByEmail(email: string): Promise<User | null>
}
```

---

### 🧩 Implementation Example
```ts
@Repository({
  entity: User,
  technology: 'Postgres',
  context: 'User',
  description: 'User repository with relational DB'
})
export class PostgresUserRepository extends DaoRepository<User> implements UserRepository {
  constructor(private readonly db: PrismaClient) {
    super(User)
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.db.user.findUnique({ where: { email } })
    return data ? User.fromPrimitives(data) : null
  }
}
```
