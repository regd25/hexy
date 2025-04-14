### Factories

- Ubicación: `/context/<context>/factory/`
- Encapsulan la construcción de Aggregates o Entidades complejas.
- Separan la lógica de creación del constructor directo.

---

### 🧱 Reglas

- Solo deben operar con Value Objects o datos primitivos ya validados.
- Nunca deben contener lógica de negocio.
- Nombres claros: `createFromPrimitives`, `createWithDefaults`, `reconstruct`, etc.
- Si requieren dependencias, se permite usar `@Injectable()` para inyectarlas.

---

### 🧪 Pruebas

- Archivo: `<nombre>.factory.spec.ts`
- Ubicación: junto a la implementación o en `__tests__/`

---

### 🧩 Decorador `@Factory`

- Opcional: permite registrar metadata para tooling.
- Campos sugeridos:
  - `context`: obligatorio
  - `target`: agregado o entidad a la que construye
  - `description`: opcional

---

### 🧩 Ejemplo
```ts
@Factory({
  context: 'User',
  target: User,
  description: 'Construye un usuario a partir de datos planos'
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
