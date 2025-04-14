### 🧱 Plan de Implementación: Caso de Uso Create Context

**🎯 Objetivo:** Permitir a través de CLI crear la estructura base de un nuevo contexto siguiendo la arquitectura de Hexy (DDD + Hexagonal).

**📥 Input esperado:**
- Nombre del contexto (e.g. `billing`)
- Opcional: parámetros para configuración inicial

**🛠 Tareas por fase:**

#### Fase 1 – Modelado
1. Definir el comando: `hexy create context <nombre>`
2. Establecer los paths que deben crearse:
   - `/src/context/<context>/domain/`
   - `/src/context/<context>/application/`
   - `/src/context/<context>/infrastructure/`
   - `/src/context/<context>/module.ts`

#### Fase 2 – Implementación
3. Implementar generador CLI con Node.js + filesystem
4. Verificar colisión de nombres
5. Generar estructura mínima con placeholders y `README.md` opcional
6. Crear `module.ts` con boilerplate básico de registro de dependencias

#### Fase 3 – Testing
7. Testear en entorno de desarrollo:
   - Contextos válidos
   - Nombres reservados o inválidos
   - Sobreescritura accidental

#### Fase 4 – Documentación
8. Registrar en documentación de comandos CLI
9. Agregar entrada en help global de `hexy`

**📦 Artefactos generados:**
- Carpeta completa del contexto
- `module.ts` inicial con `registerModule()`
- Logs de ejecución en consola

**🧩 CLI Final:**
```bash
hexy create context billing
```

**✅ Validaciones:**
- [ ] Estructura mínima creada correctamente
- [ ] `module.ts` contiene plantilla válida
- [ ] No sobreescribe si ya existe
- [ ] Aparece en documentación

---

### 🧱 Subplan: Generación Base de Componentes del Contexto

**🎯 Objetivo:** Generar automáticamente los artefactos base requeridos por la arquitectura de Hexy al crear un nuevo contexto.

**📥 Input Esperado:**
- Nombre del servicio principal
- Casos de uso base
- Lista de entidades, agregados y value objects opcionales

**🛠️ Tareas a ejecutar:**

#### Fase 1 — Aggregates y Entidades
1. Generar archivo `aggregate/<entity>.aggregate.ts`
2. Decorar con `@Aggregate({ context, events })`
3. Generar entidades internas si aplica
4. Implementar `toPrimitive()` y métodos públicos explícitos

#### Fase 2 — Value Objects
5. Crear value objects base en `value-object/`
6. Decorar con `@ValueObject({ context, primitive })`
7. Incluir validaciones internas

#### Fase 3 — Repositories
8. Crear interfaz en `domain/repository/<entity>.repository.ts`
9. Implementar clase DAO en `infrastructure/adapter/postgres/`
10. Decorar implementación con `@Repository()`

#### Fase 4 — Services
11. Crear clase en `application/service/<service>.service.ts`
12. Decorar con `@Service()`
13. Inyectar repositorio y agregar métrica de ejemplo con `Telemetry`

#### Fase 5 — UseCases
14. Crear casos de uso en `application/use-case/`
15. Decorar con `@UseCase()` y extender de `CommandUseCase` o `QueryUseCase`
16. Inyectar servicios y construir flujo con `.execute()`

#### Fase 6 — Tests Base
17. Generar archivos de prueba:
   - `.usecase.spec.ts`
   - `.service.spec.ts`
   - `.aggregate.spec.ts`
   - `.value-object.spec.ts`
   - `.repository.spec.ts` (mock/integración)
18. Incluir pruebas dummy y estructuras de mocking listas

---

**📦 Artefactos adicionales generados:**
- Aggregate(s), ValueObject(s), Entity(s)
- Interfaces de repositorio y adaptadores base
- Service(s) con telemetría
- UseCase(s) con flujo completo
- Archivos `.spec.ts` en cada módulo

**📌 CLI Sugerida Extendida:**
```bash
hexy create context billing \
  --service invoice \
  --aggregate Invoice \
  --value-object Amount \
  --use-case generateInvoice \
  --use-case sendInvoice
```

**✅ Validaciones:**
- [ ] Decoradores correctamente aplicados
- [ ] Artefactos generados en rutas correctas
- [ ] Casos de uso ejecutables con `.run()`
- [ ] Tests iniciales pasan
