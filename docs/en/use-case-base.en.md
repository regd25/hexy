### Base Class: UseCase

The `UseCase` class defines a standardized execution flow for all use cases in Hexy. It wraps the core logic with optional lifecycle hooks such as `beforeExecute`, `afterExecute`, and `onError`.

Recommended location: `/src/core/context/use-case/use-case.ts`

---

### 🔁 UseCase Lifecycle

1. **`run(input)`**: public entry point, executes the full flow.
2. **`beforeExecute(input)`**: optional pre-processing hook.
3. **`execute(input)`**: core logic, must be implemented.
4. **`afterExecute(output)`**: optional post-processing hook.
5. **`onError(error, input)`**: error-handling hook.

---

### 🧩 Structure
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

### ✅ Benefits
- Enables cross-cutting behavior (observability, validation, logging).
- Prevents repeating try/catch in every implementation.
- Improves clarity and extensibility of execution flow.

---

This pattern is used in `CommandUseCase`, `QueryUseCase`, and `EventHandlerUseCase`, all of which extend `UseCase`.
