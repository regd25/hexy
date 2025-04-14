### Estrategia de Testing en Hexy

Hexy promueve pruebas en capas para asegurar la estabilidad, la trazabilidad y la confianza en la arquitectura.

---

### 🧪 Tipos de pruebas por componente

#### ✅ Value Objects / Entidades
- Pruebas unitarias puras
- Comparación, validación, toPrimitive()

#### ✅ Aggregates
- Validación de invariantes
- Métodos de comportamiento
- Métodos `toPrimitive()` y `applyEvent()` si aplica

#### ✅ Services
- Pruebas unitarias del flujo de negocio
- Mocks de repositorios o dependencias

#### ✅ UseCases
- Orquestación completa
- Mocks de servicios, repos y eventBus
- Ejecutar vía `.run(input)` o `.execute(input)`

#### ✅ EventHandlers
- Entrada = evento
- Verifica efectos secundarios
- No deben retornar valores

#### ✅ Factories
- Devuelven entidades o agregados construidos correctamente
- Simulan datos válidos y edge cases

#### ✅ Specifications
- Verifican reglas booleanas
- `isSatisfiedBy` debe retornar true/false según input

#### ✅ Repositories (abstractos)
- Mockeados en tests de Services y UseCases
- Prueban integración mediante tests de Adapter

#### ✅ Adapters
- Pruebas de integración reales
- HTTP, S3, DB, WebSocket, correo, etc.

#### ✅ Controllers / WebSocketHandlers
- Simulan entrada (HTTP o socket)
- Verifican salida esperada y que invoquen el UseCase

---

### 📁 Ubicación estándar

- Tests junto a los archivos o en `/__tests__/`
- Nombre del archivo: `<nombre>.spec.ts` o `<nombre>.<tipo>.spec.ts`

---

### 🧩 Herramientas

- `jest`, `supertest`, `faker`

---

### 📌 Buenas prácticas

- Una prueba por escenario
- Usa mocks controlados, no mocks vacíos
- No mockees lógica de dominio
- Mantén separados los tests unitarios de los de integración

---

Este documento se aplica a todos los módulos definidos en Hexy.
