# 📁 Estructura del Proyecto en Hexy

Hexy sigue una organización basada en Contextos y Arquitectura Hexagonal. La estructura base se ve así:

```
/src
  └── context/
        └── <nombre-del-contexto>/
              ├── application/
              │     ├── use-case/
              │     ├── service/
              │     └── event-handler/
              ├── domain/
              │     ├── aggregate/
              │     ├── value-object/
              │     ├── port/
              │     └── specification/
              ├── infrastructure/
              │     ├── adapter/
              │     │     └── (opcional: por tecnología o tipo)
              │     └── config/
              └── module.ts

/shared
  ├── dto/
  │    └── v1/
  ├── events/
  │    └── <contexto>/
  └── utils/
```

---

## 📌 Convenciones clave

- Cada contexto es un límite de negocio con su propia independencia lógica.
- Los **UseCases** son el punto de entrada para cada operación del sistema.
- **Services** encapsulan lógica del dominio.
- **Aggregates**, **Value Objects** y **Specifications** modelan las reglas y estructura del dominio.
- **Ports** son interfaces que el dominio espera.
- **Adapters** implementan esos puertos para conectarse a infraestructura externa.
- **Event Handlers** responden a eventos y ejecutan acciones secundarias.
- **Module.ts** es el archivo de arranque para registrar todo el wiring y dependencias del contexto.

---

## 🧱 Recomendaciones

- Cada archivo debe ser explícito en su nombre: `generate-invoice.usecase.ts`, `invoice.aggregate.ts`, etc.
- Si tienes múltiples adaptadores del mismo tipo, puedes agruparlos en subcarpetas por tecnología o dominio (`adapter/email/`, `adapter/postgres/`).
- No compartas entidades ni lógica entre contextos. Usa DTOs en `/shared`.

---

### ✅ Para crear tu primer contexto:
```bash
hexy create context billing
```

Esto creará la estructura base en `/context/billing/`.
