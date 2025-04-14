### Repositorios

- Abstracción ubicada en: `/context/<context>/repository/`
- Implementaciones en: `/context/<context>/adapter/<db>/`

---

### 🧱 Diseño recomendado

- Extiende de `BaseRepository<T>` para contrato base común.
- Usa `DaoRepository<T>` para implementación concreta con mapeo `toPrimitive`/`fromPrimitives`.
- Decora la implementación con `@Repository({ ... })` para registrar metadatos.
- Inyección mediante token, nunca instanciación directa.

---

### 🧪 Pruebas

- Lógica abstracta: tests en `__tests__/` de dominio (mockeando infraestructura).
- Integración: tests en la carpeta de adapter: `<tecnología>-<nombre>.repository.spec.ts`

---

### 🧩 Decorador `@Repository`

- Se usa en la implementación (no en la abstracción)
- Campos:
  - `entity`: clase de entidad (ej. `User`)
  - `technology`: tipo de tecnología (ej. `'Postgres'`)
  - `context`: nombre del contexto
  - `description`: opcional

---

### 🧩 Ejemplo de abstracción
```ts
export abstract class UserRepository extends BaseRepository<User> {
  abstract findByEmail(email: string): Promise<User | null>
}
```

---

### 🧩 Ejemplo de implementación
```ts
@Repository({
  entity: User,
  technology: 'Postgres',
  context: 'User',
  description: 'Repositorio de usuario con persistencia relacional'
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
