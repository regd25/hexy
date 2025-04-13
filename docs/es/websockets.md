### WebSocket Handler

- Ubicación: `/context/<context>/infrastructure/adapter/ws/handler/`
- Permite manejar eventos entrantes desde WebSocket y delegarlos a UseCases.
- Debe estar decorado con `@WebSocketHandler({ ... })`.

---

### 🧱 Estructura

- Decorar la clase con `@WebSocketHandler({ event })`
- Implementar un método `handle(payload)` o `execute(data)`
- Inyectar servicios o UseCases vía constructor

---

### 🧩 Decorador `@WebSocketHandler`

- Campos:
  - `event`: nombre del evento WebSocket que manejará
  - `context`: requerido
  - `description`: opcional

---

### 🧪 Pruebas

- Archivo: `<nombre>.ws-handler.spec.ts`
- Usar mocks del socket y del UseCase asociado

---

### 🧩 Ejemplo
```ts
@WebSocketHandler({
  event: 'user:typing',
  context: 'Chat',
  description: 'Maneja evento de usuario escribiendo'
})
export class UserTypingHandler {
  constructor(private readonly useCase: MarkUserTypingUseCase) {}

  async execute(payload: { userId: string; roomId: string }) {
    await this.useCase.execute(payload)
  }
}
```
