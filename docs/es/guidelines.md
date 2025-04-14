### Guía de Flujo de Desarrollo en Hexy

Hexy sigue una arquitectura basada en Domain-Driven Design y Hexagonal Architecture. Esta guía describe el flujo principal de una aplicación, desde la entrada hasta la ejecución de efectos secundarios.

---

### 🔁 Flujo general

```plaintext
Cliente → Controller → UseCase (run) → Service → Repository → Aggregate → Event → EventHandler
```

---

### 📁 Estructura del Proyecto en Hexy

Hexy sigue una organización basada en Contextos y Arquitectura Hexagonal. La estructura base se ve así:

```
/src
  └── context/
        └── <nombre-del-contexto>/
              ├── use-case/
              ├── service/
              └── event-handler/
              ├── aggregate/
              ├── value-object/
              ├── port/
              └── specification/
              ├── adapter/
              │     └── (optional: by technology or concern)
              └── config/
              └── module.ts

/shared
  ├── dto/
  │    └── v1/
  ├── events/
  │    └── <contexto>/
  └── utils/
```****

---

### 📌 Convenciones clave

- Cada contexto es un límite de negocio con su propia independencia lógica.
- Los **UseCases** son el punto de entrada para cada operación del sistema.
- **Services** encapsulan lógica del dominio.
- **Aggregates**, **Value Objects** y **Specifications** modelan las reglas y estructura del dominio.
- **Ports** son interfaces que el dominio espera.
- **Adapters** implementan esos puertos para conectarse a infraestructura externa.
- **Event Handlers** responden a eventos y ejecutan acciones secundarias.
- **Module.ts** es el archivo de arranque para registrar todo el wiring y dependencias del contexto.

---

### 🧱 Recomendaciones

- Cada archivo debe ser explícito en su nombre: `generate-invoice.usecase.ts`, `invoice.aggregate.ts`, etc.
- Si tienes múltiples adaptadores del mismo tipo, puedes agruparlos en subcarpetas por tecnología o dominio (`adapter/email/`, `adapter/postgres/`).
- No compartas entidades ni lógica entre contextos. Usa DTOs en `/shared`.

---

### ✅ Para crear tu primer contexto:
```bash
hexy create context billing
```

Esto creará la estructura base en `/context/billing/`.


---

### 🎯 Entradas al sistema

- HTTP (vía Controller)
- WebSocket (vía `@WebSocketHandler`)
- Mensajería/Eventos (vía `@EventHandler`)
- Tareas programadas o Pollers (próximamente)

---

### ⚙️ Capas y responsabilidades

- **Controller**: adapta entrada externa (HTTP → DTO), delega a UseCase
- **WebSocketHandler**: adapta eventos de socket entrantes y delega a UseCases
- **UseCase**: orquesta servicios, puede emitir eventos
- **Service**: contiene reglas de negocio específicas
- **Repository**: acceso a almacenamiento vía puertos
- **Aggregate**: modelo de consistencia que valida y encapsula estado
- **EventHandler**: ejecuta efectos secundarios cuando ocurre un evento

---

### 🧩 Decoradores esperados

- `@Controller`, `@WebSocketHandler`, `@UseCase`, `@Service`, `@Aggregate`, `@EventHandler`, `@DomainEvent`
- Todos deben incluir `context` como mínimo para trazabilidad y documentación

---

### 🧪 Pruebas

- **Controller** → HTTP tests o mocks (`supertest`)
- **WebSocketHandler** → pruebas simulando el socket y el payload
- **UseCase** → test unitario, mocks de servicios/repos
- **Service** → reglas de negocio puras
- **Aggregate** → consistencia, validación, `toPrimitive`
- **EventHandler** → test como UseCase (evento como input)
- **Repository (abstracto)** → pruebas con mocks
- **Adapter** → pruebas de integración

---

### 🧠 Visualización

Hexy puede escanear los decoradores y generar:

- Diagrama de flujo de ejecución
- Mapa de eventos
- Diagrama de puertos y adaptadores
- Relación entre contextos

---

Esta guía debe consultarse al iniciar cada módulo o contexto.
