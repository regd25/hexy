### Value Objects (Objetos de Valor)

- Ubicación: `/context/<context>/value-object/`
- Representan conceptos del dominio sin identidad propia.
- Son inmutables, comparables por valor y encapsulan lógica propia.
- Deben estar decorados con `@ValueObject({ ... })` para registrar metadata útil para herramientas o visualización.

---

### 🧱 Reglas de estructura

- Deben ser `readonly` o `private`, sin setters.
- Deben validarse en su constructor o al extender de `PrimitiveValueObject<T>`.
- Comparan mediante `equals()` u operadores definidos.
- Implementan `toPrimitive()` para exponer su valor.

---

### 🧪 Pruebas

- Archivo de pruebas: `<nombre>.spec.ts`
- Ubicación sugerida: misma carpeta o en `__tests__/`
- Ejemplo: `username.spec.ts`

---

### 🧩 Decorador `@ValueObject({ ... })`

- `context`: (string) obligatorio — indica a qué contexto pertenece el VO.
- `name`: (string) opcional — deducido por defecto del nombre de clase.
- `description`: (string) opcional — útil para documentación.
- `primitive`: (string) opcional — tipo que representa: `string`, `number`, `Date`, etc.

---

### 🧩 Ejemplo
```ts
@ValueObject({
  context: 'User',
  description: 'Nombre de usuario no vacío',
  primitive: 'string'
})
export class Username extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value.trim()) {
      throw new Error('El nombre de usuario no puede estar vacío')
    }
  }
}
```

---

### 🧠 Buenas prácticas

- Nunca deben aceptar o retornar strings crudos sin validar.
- Siempre se construyen explícitamente desde sus UseCases o Services.
- Son ideales para encapsular reglas (Ej. `Money`, `Username`, `Coordinates`, etc.).
