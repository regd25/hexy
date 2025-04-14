### WebSocket Handler

- Location: `/context/<context>/infrastructure/adapter/ws/handler/`
- Handles incoming WebSocket events and delegates to UseCases.
- Must be decorated with `@WebSocketHandler({ ... })`.

---

### 🧱 Structure

- Decorate the class with `@WebSocketHandler({ event })`
- Implement a `handle(payload)` or `execute(data)` method
- Inject services or UseCases via constructor

---

### 🧩 `@WebSocketHandler` Decorator

- Fields:
  - `event`: the WebSocket event this handler listens to
  - `context`: required
  - `description`: optional

---

### 🧪 Testing

- File: `<name>.ws-handler.spec.ts`
- Use socket mocks and mock UseCase

---

### 🧩 Example
```ts
@WebSocketHandler({
  event: 'user:typing',
  context: 'Chat',
  description: 'Handles user typing event'
})
export class UserTypingHandler {
  constructor(private readonly useCase: MarkUserTypingUseCase) {}

  async execute(payload: { userId: string; roomId: string }) {
    await this.useCase.execute(payload)
  }
}
```
