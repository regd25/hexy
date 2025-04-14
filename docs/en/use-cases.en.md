### UseCases

- Location: `/context/<context>/application/use-case/`
- Each UseCase must extend one of the following base classes:
  - `CommandUseCase<Input, Output>` — for state-changing operations.
  - `QueryUseCase<Input, Output>` — for read-only operations.
  - `EventHandler<Event>` — for domain event reactions.

#### ✅ Naming Convention
- File suffix: `.usecase.ts`
- Example: `generate-invoice.usecase.ts`

#### 🧪 Testing Convention
- Test file: `<name>.usecase.spec.ts`
- Example: `generate-invoice.usecase.spec.ts`

#### 🧩 Required Decorator
- `@UseCase({ summary, inputSchema, outputSchema, tags })`
  - Automatically applies `@Traceable` and `@DescribeUseCase`.

#### 🧱 Structure Guidelines
- Constructor must only receive domain services or ports.
- The `execute()` method should:
  - Return primitives, DTOs, or Result<T>.
  - Never return domain entities directly.
  - Throw `AppError` or return a safe result.

---

### Base Class: UseCase

The `UseCase` class defines a standardized execution flow for all use cases in Hexy. It wraps core logic with optional hooks like `beforeExecute`, `afterExecute`, and `onError`.

---

### 🔁 UseCase Lifecycle

1. **`run(input)`** — public entry point, executes the full flow.
2. **`beforeExecute(input)`** — optional pre-processing hook.
3. **`execute(input)`** — main logic, must be implemented.
4. **`afterExecute(output)`** — optional post-processing hook.
5. **`onError(error, input)`** — error handler.

---

### 🧩 Structure
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

This pattern is used across `CommandUseCase`, `QueryUseCase`, and `EventHandler`, all extending from `UseCase`.

---

### 📌 Implementation Examples

**CommandUseCase**
```ts
@UseCase({
  summary: 'Generates a new invoice for a given order',
  inputSchema: GenerateInvoiceInput,
  outputSchema: GenerateInvoiceOutput,
  tags: ['billing']
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
  summary: 'Get all invoices from the current month',
  inputSchema: GetMonthlyInvoicesInput,
  outputSchema: GetMonthlyInvoicesOutput,
  tags: ['billing']
})
export class GetMonthlyInvoicesUseCase extends QueryUseCase<GetMonthlyInvoicesInput, GetMonthlyInvoicesOutput[]> {
  constructor(private readonly invoiceQuery: InvoiceQueryPort) {
    super();
  }

  async execute(input: GetMonthlyInvoicesInput): Promise<GetMonthlyInvoicesOutput[]> {
    return this.invoiceQuery.findInvoicesByMonth(input.month);
  }
}
```