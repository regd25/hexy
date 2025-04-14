### Puertos y Adaptadores

- Hexy implementa el patrón Ports and Adapters como eje central de su arquitectura.
- Los puertos definen contratos abstractos que la infraestructura implementa.
- Se definen en: `/context/<context>/port/`
- Las implementaciones se colocan en: `/context/<context>/adapter/<tipo>/`

---

### 🧭 Tipos comunes de Puertos en Hexy

- Repositorios → ver [repositories.md]
- Adaptadores externos → ej. `EmailSender`, `StorageService`, `PaymentGateway`
- Observabilidad → ver [observability.md]
- EventBus -> `SnsEventBus`, `SqsEventBus`
- Mensajería → `QueueConsumer`, `EventSubscriber`

---

### 🧱 Reglas

- Los puertos son contratos del dominio hacia infraestructura.
- Las implementaciones deben cumplir ese contrato y nunca importar lógica de dominio.
- Se recomienda usar tokens para la inyección.

---

### 🧪 Pruebas

- Pruebas de adaptadores en `adapter/` como integración.
- Mockeo de puertos en pruebas de dominio o application.

---

### 🧩 Decorador `@Port` (en el contrato)

- Opcional, permite registrar el tipo de puerto.
- Campos:
  - `context`: (string) requerido
  - `description`: (string) opcional

---

### 🧩 Decorador `@Adapter` (en la implementación)

- Opcional, usado para identificar el tipo de implementación.
- Campos:
  - `technology`: (string) requerido
  - `for`: clase del puerto que implementa
  - `description`: opcional

---

### 🧩 Ejemplo
```ts
@Port({ context: 'User', description: 'Servicio de envío de correos' })
export interface EmailSender {
  send(data: { to: string; subject: string; body: string }): Promise<void>
}
```

```ts
@Adapter({ technology: 'Sendgrid', for: EmailSender, description: 'Adaptador vía Sendgrid' })
export class SendgridEmailSender implements EmailSender {
  async send(data: { to: string; subject: string; body: string }): Promise<void> {
    // implementación
  }
}
```
