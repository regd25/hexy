### Decoradores y Documentación

Hexy utiliza decoradores como punto central para registrar metadata estructurada. Esto permite generar automáticamente documentación, diagramas y herramientas como Agrovisual.

---

### 🎯 Decoradores disponibles

- `@UseCase({ ... })`
- `@Service({ ... })`
- `@EventHandler({ ... })`
- `@DomainEvent({ ... })`
- `@Aggregate({ ... })`
- `@Repository({ ... })`
- `@Factory({ ... })`
- `@ValueObject({ ... })`
- `@Specification({ ... })`
- `@Port({ ... })`
- `@Adapter({ ... })`
- `@Traceable()`

---

### 🧱 Convenciones

- Todos deben incluir al menos el campo `context`.
- Ninguno debe producir efectos secundarios.
- Solo registran metadata accesible por tooling.

---

### 🧩 Ejemplo combinado

```ts
@Traceable()
@UseCase({
  context: 'Billing',
  summary: 'Genera una factura',
  inputSchema: GenerateInvoiceInput,
  outputSchema: GenerateInvoiceOutput
})
export class GenerateInvoiceUseCase extends CommandUseCase<GenerateInvoiceInput, GenerateInvoiceOutput> {
  // ...
}
```

---

### 🛠 Generación automática

Hexy puede utilizar estos decoradores para construir:

- Documentación de casos de uso
- Diagrama de eventos y agregados
- Relación entre puertos y adaptadores
- Índice de ValueObjects, errores, comandos, specs

---

### 🧪 Pruebas

- Los decoradores deben testearse como funciones puras.
- Usar clases dummy y `Reflect.getMetadata` para validar.
