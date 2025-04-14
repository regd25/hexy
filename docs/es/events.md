### Eventos de Dominio

- Ubicación: `/context/<context>/domain/event/`
- Son clases inmutables que representan hechos del dominio.
- Deben extender de `DomainEvent` y estar decorados con `@DomainEvent({ ... })`

---

### 🧱 Reglas

- Inmutables, solo lectura.
- Su constructor define todos los campos.
- Exponen un método `toPrimitive()` para serializarse.

---

### 🧩 Decorador `@DomainEvent({ ... })`

- Campos:
  - `context`: obligatorio
  - `version`: opcional, por defecto `'v1'`
  - `description`: opcional

---

### 🧩 Ejemplo
```ts
@DomainEvent({ context: 'User', description: 'Evento que indica un nuevo usuario registrado' })
export class UserRegistered extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super()
  }

  toPrimitive() {
    return {
      userId: this.userId,
      email: this.email
    }
  }
}
```

---

### Manejadores de Eventos (Event Handlers)

- Ubicación: `/context/<context>/application/event-handler/`
- Responden a eventos del dominio ejecutando efectos secundarios.
- Deben extender de `BaseEventHandler<Event>` y estar decorados con `@EventHandler(...)`

---

### 🧱 Reglas de estructura

- No retornan datos, solo ejecutan efectos secundarios.
- Solo dependen de servicios del dominio (no acceden a infraestructura directamente).
- Idealmente 1 handler por evento.

---

### 🧪 Pruebas

- Archivo: `<nombre>.event-handler.spec.ts`
- Ubicación: misma carpeta o en `__tests__/`
- Debe simular el evento como entrada y verificar interacciones

---

### 🧩 Decorador `@EventHandler({ ... })`

- Campos:
  - `event`: clase de evento que maneja
  - `traceable`: opcional, para activar telemetría
  - `description`: opcional

---

### 🧩 Ejemplo
```ts
@EventHandler({ event: UserRegistered, traceable: true })
export class SendWelcomeEmail extends BaseEventHandler<UserRegistered> {
  constructor(private readonly mailer: MailerService) {
    super()
  }

  async execute(event: UserRegistered): Promise<void> {
    await this.mailer.send({
      to: event.email,
      subject: '¡Bienvenido!',
      body: 'Gracias por registrarte'
    })
  }
}
```

---

