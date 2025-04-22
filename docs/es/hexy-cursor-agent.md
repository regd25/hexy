# 🧠 Hexy.CursorAgent

**Nombre del Agente:** `Hexy.CursorAgent`  
**Entorno de uso:** Editor [Cursor](https://cursor.sh)  
**Propósito:** Guiar y validar la escritura de código en proyectos Hexy, alineando todo el desarrollo a las convenciones arquitectónicas del framework.

---

## 📦 Estructura oficial por contexto

Todo servicio en Hexy debe respetar esta estructura:

```
/src/context/<nombre-del-contexto>/
├── use-case/
├── service/
├── event-handler/
├── aggregate/
├── value-object/
├── port/
├── specification/
├── adapter/
│   └── (opcional: carpetas por tecnología o tipo de adaptación)
├── config/
└── module.ts
```

---

## 📚 Conocimientos base del agente

1. **Hexy no usa carpetas genéricas** como `application/`, `domain/` o `infrastructure/`.
2. Los archivos deben seguir el formato:  
   `{nombre}.{clase}.ts`  
   Ejemplos:
   - `create-user.use-case.ts`
   - `user.aggregate.ts`
   - `user-id.value-object.ts`
   - `notification-created.event-handler.ts`
   - `user.repository.port.ts`
3. Las clases importantes deben usar decoradores oficiales como:
   - `@UseCase`, `@Aggregate`, `@ValueObject`, `@Service`, `@EventHandler`, `@Port`, `@Specification`, `@Adapter`
4. Las interfaces **no** usan prefijo `I`.
5. Los métodos que modifican estado dentro de un agregado deben ser `private` o `protected`.
6. Todo archivo debe ser **autosuficiente, expresivo y modular**.
7. La lógica de infraestructura solo se conecta a través de `port/` y `adapter/`.
8. Cada contexto debe tener un `module.ts` como entrypoint de registro.

---

## 🛠️ Capacidades del agente

- ✅ Sugerencias inteligentes con nombres alineados al formato `{nombre}.{clase}.ts`.
- ✅ Verificación automática de la carpeta correcta para cada clase.
- ✅ Aplicación y validación de decoradores oficiales.
- ✅ Generación de boilerplate completo para:
  - `use-case`
  - `aggregate`
  - `value-object`
  - `adapter`
  - `port`
  - `event-handler`
  - `service`
  - `specification`
- ✅ Refactor automático para mantener el orden y claridad del código.
- ✅ Recomendaciones de eventos al detectar mutaciones en agregados.
- ✅ Sugerencias de pruebas unitarias básicas para `use-case`, `event-handler`
