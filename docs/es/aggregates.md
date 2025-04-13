### Aggregates

- Ubicación: `/context/<context>/domain/aggregate/`
- Un Aggregate representa una unidad de consistencia transaccional del dominio.
- Debe extender de `AggregateRoot`.
- Debe estar decorado con `@Aggregate({ ... })` para registrar su contexto, eventos y comandos.
- Contiene entidades e invariantes internas que solo pueden modificarse desde su raíz.

---

### 🧱 Estructura

- Todos sus campos internos deben ser `private` o `protected`.
- Solo se deben exponer métodos de intención clara.
- No se permiten getters públicos salvo para lectura simple.
- Debe implementar `toPrimitive()` para exponer datos seguros.
- Debe construirse usando Value Objects, no primitivos crudos.
- No debe usarse directamente en capas externas: siempre a través de UseCases o Services.

---

### 🧩 Campos del decorador `@Aggregate({ ... })`

- `context`: (string) obligatorio – nombre del contexto de negocio.
- `events`: (EventClass[]) lista de eventos emitidos por el agregado.
- `commandHandlers`: (InjectionToken[]) lista de comandos que este agregado puede manejar.
- `description`: (string) opcional – texto explicativo para documentación.
- `version`: (string) opcional – por defecto es 'v1'.
- `name`: (string) opcional – si no se define, se deduce del nombre de clase.

> ⚠️ **Los `commandHandlers` deben declararse usando `InjectionToken` definidos dentro del mismo contexto o en `/shared`. Nunca deben importarse desde otro contexto para evitar romper el principio de dependencia del dominio.**

---

### 🧩 Ejemplo
```ts
import { Aggregate } from '@/shared/metadata'
import { InvoiceCreated, InvoicePaid } from '../event'
import { COMMANDS } from '../shared/command.tokens'

@Aggregate({
  context: 'Billing',
  version: 'v1',
  events: [InvoiceCreated, InvoicePaid],
  commandHandlers: [COMMANDS.GenerateInvoice, COMMANDS.MarkInvoiceAsPaid],
  description: 'Agregado que representa una factura y sus pagos'
})
export class Invoice extends AggregateRoot {
  constructor(
    private readonly id: InvoiceId,
    private readonly amount: Money,
    private readonly date: InvoiceDate
  ) {
    super();
  }

  get total(): number {
    return this.amount.toNumber();
  }

  toPrimitive() {
    return {
      id: this.id.value,
      amount: this.amount.toNumber(),
      date: this.date.toISO()
    }
  }
}
```
