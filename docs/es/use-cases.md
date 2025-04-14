### Casos de Uso (UseCases)

- Ubicación: `/context/<context>/application/use-case/`
- Cada UseCase debe ser una clase que extienda uno de los siguientes tipos:
  - `CommandUseCase<Input, Output>` — para operaciones que modifican estado.
  - `QueryUseCase<Input, Output>` — para consultas sin efectos secundarios.
  - `EventHandler<Event>` — para casos que responden a eventos de dominio.

#### ✅ Convención de nombres
- Sufijo de archivo: `.usecase.ts`
- Ejemplo: `generate-invoice.usecase.ts`

#### 🧪 Convención de pruebas
- Archivo de prueba: `<nombre>.usecase.spec.ts`
- Ejemplo: `generate-invoice.usecase.spec.ts`

#### 🧩 Decorador requerido
- `@UseCase({ summary, inputSchema, outputSchema, tags })`
  - Aplica automáticamente `@Traceable` y `@DescribeUseCase`.

#### 🧱 Reglas de estructura
- Constructor solo con dependencias del dominio.
- El método `execute()` debe:
  - Devolver primitivos, DTOs o Result<T>.
  - Nunca retornar entidades del dominio directamente.
  - Lanzar `AppError` o retornar un resultado seguro.

---

### Clase Base: UseCase

La clase `UseCase` define un flujo de ejecución estandarizado para todos los casos de uso dentro de Hexy. Esto permite envolver la lógica central con hooks opcionales como `beforeExecute`, `afterExecute` y `onError`.

---

### 🔁 Ciclo de Vida del UseCase

1. **`run(input)`**: punto de entrada público, ejecuta el ciclo completo.
2. **`beforeExecute(input)`**: hook opcional previo a la lógica principal.
3. **`execute(input)`**: lógica principal, debe ser implementada.
4. **`afterExecute(output)`**: hook opcional después de ejecutar.
5. **`onError(error, input)`**: hook de manejo de errores.

---

### 🧩 Estructura
```ts
export abstract class UseCase<Input extends UseCaseInput, Output extends UseCaseOutput> {
  abstract execute(input: Input): Promise<Output>

  async run(input: Input): Promise<Output> {
    try {
      await this.beforeExecute(input)
      const result = await this.execute(input)
      await this.afterExecute(result)
      return result
    } catch (error) {
      await this.onError(error, input)
      throw error
    }
  }

  protected async beforeExecute(input: Input): Promise<void> {}
  protected async afterExecute(output: Output): Promise<void> {}
  protected async onError(error: any, input: Input): Promise<void> {}
}
```

---

Este patrón es utilizado tanto en `CommandUseCase`, `QueryUseCase` como en `EventHandler`, heredando directamente de `UseCase`.

---

### 📌 Ejemplos de Implementación

**CommandUseCase**
```ts
@UseCase({
  summary: 'Genera una nueva factura para una orden dada',
  inputSchema: GenerateInvoiceInput,
  outputSchema: GenerateInvoiceOutput,
  tags: ['facturación']
})
export class GenerateInvoiceUseCase extends CommandUseCase<GenerateInvoiceInput, GenerateInvoiceOutput> {
  constructor(private readonly invoiceService: InvoiceService) {
    super();
  }

  async execute(input: GenerateInvoiceInput): Promise<GenerateInvoiceOutput> {
    const invoice = this.invoiceService.create(input);
    await this.invoiceService.save(invoice);
    return invoice.toPrimitive();
  }
}
```

**QueryUseCase**
```ts
@UseCase({
  summary: 'Consulta facturas del mes actual',
  inputSchema: GetMonthlyInvoicesInput,
  outputSchema: GetMonthlyInvoicesOutput,
  tags: ['facturación']
})
export class GetMonthlyInvoicesUseCase extends QueryUseCase<GetMonthlyInvoicesInput, GetMonthlyInvoicesOutput[]> {
  constructor(private readonly invoiceQuery: InvoiceQueryPort) {
    super();
  }

  async execute(input: GetMonthlyInvoicesInput): Promise<GetMonthlyInvoicesOutput> {
    return this.invoiceQuery.findInvoicesByMonth(input.month);
  }
}
```