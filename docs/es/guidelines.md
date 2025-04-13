### Guía de Flujo de Desarrollo en Hexy

Hexy sigue una arquitectura basada en Domain-Driven Design y Hexagonal Architecture. Esta guía describe el flujo principal de una aplicación, desde la entrada hasta la ejecución de efectos secundarios.

---

### 🔁 Flujo general

```plaintext
Cliente → Controller → UseCase (run) → Service → Repository → Aggregate → Event → EventHandler
```

---

### 🧱 Estructura por contexto

- `application/` → Orquestación y casos de uso
- `domain/` → Modelo de dominio, reglas, contratos
- `infrastructure/` → Adaptadores a bases de datos, eventos, APIs externas

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
