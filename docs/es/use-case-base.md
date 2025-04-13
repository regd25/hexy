### Clase Base: UseCase

La clase `UseCase` define un flujo de ejecución estandarizado para todos los casos de uso dentro de Hexy. Esto permite envolver la lógica central con hooks opcionales como `beforeExecute`, `afterExecute` y `onError`.

Ubicación recomendada: `/src/core/context/application/use-case/use-case.ts`

---

### 🔁 Ciclo de Vida del UseCase

1. **`run(input)`**: punto de entrada público, ejecuta el ciclo completo.
2. **`beforeExecute(input)`**: hook opcional previo a la lógica principal.
3. **`execute(input)`**: lógica principal, debe ser implementada.
4. **`afterExecute(output)`**: hook opcional después de ejecutar.
5. **`onError(error, input)`**: hook de manejo de errores.

---

### 🧩 Estructura
```ts
export abstract class UseCase<Input extends UseCaseInput, Output extends UseCaseOutput> {
  abstract execute(input: Input): Promise<Output>

  async run(input: Input): Promise<Output> {
    try {
      await this.beforeExecute(input)
      const result = await this.execute(input)
      await this.afterExecute(result)
      return result
    } catch (error) {
      await this.onError(error, input)
      throw error
    }
  }

  protected async beforeExecute(input: Input): Promise<void> {}
  protected async afterExecute(output: Output): Promise<void> {}
  protected async onError(error: any, input: Input): Promise<void> {}
}
```

---

### ✅ Ventajas
- Permite comportamiento transversal (observabilidad, validación, logging).
- Evita duplicar try/catch en cada implementación.
- Mejora la claridad y extensibilidad del flujo de ejecución.

---

Este patrón es utilizado tanto en `CommandUseCase`, `QueryUseCase` como en `EventHandlerUseCase`, heredando directamente de `UseCase`.
