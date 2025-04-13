### Specifications (Especificaciones)

- Ubicación: `/context/<context>/domain/specification/`
- Encapsulan reglas booleanas reutilizables del dominio.
- No tienen efectos secundarios ni acceden a infraestructura.

---

### 🧱 Reglas

- Implementan el método `isSatisfiedBy(entity: T): boolean`
- Pueden ser combinadas con `and`, `or`, `not` si extienden de clase base `Specification<T>`
- Deben ser puras, testables y sin dependencias externas

---

### 🧪 Pruebas

- Archivo: `<nombre>.spec.ts`
- Ubicación sugerida: `__tests__/` o junto a la implementación
- Debe incluir ejemplos de entidades que cumplen y que no cumplen la condición

---

### 🧩 Decorador `@Specification`

- Ayuda a registrar metadatos para tooling o documentación
- Campos sugeridos:
  - `context`: (string) obligatorio
  - `description`: (string) opcional

---

### 🧩 Ejemplo
```ts
@Specification({ context: 'User', description: 'Verifica si el usuario está activo' })
export class IsActive extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.status === 'active'
  }
}
```
