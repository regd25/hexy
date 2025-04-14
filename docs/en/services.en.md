### Services

- Location: `/context/<context>/service/`
- Services encapsulate domain logic and coordinate model objects.
- They must be injected into UseCases via constructor.
- Services must not interact with infrastructure directly — only through ports.

#### ✅ Naming Convention
- Files must follow kebab-case with `.service.ts` suffix.
- Example: `invoice.service.ts`

#### 🧪 Testing Convention
- Test files should follow the pattern: `<name>.service.spec.ts`
- Example: `invoice.service.spec.ts`

#### 🧩 Required Decorator
- `@Service({ traceable: true })`
  - Automatically applies `@Injectable()` and optionally `@Traceable()`.
  - Allows cleaner syntax and centralized metadata.

#### 🧱 Structure Guidelines
- Inject only domain dependencies (ports, policies, event bus, logger).
- May emit domain events or apply specifications.
- Never mutate entities from outside their Aggregate.
- Must not contain infrastructure logic.

**Example:**
```ts
@Service({ traceable: true })
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly telemetry: Telemetry
  ) {}

  create(input: GenerateInvoiceInput): Invoice {
    const invoice = Invoice.create(input);
    this.telemetry.logMetric('invoice.created', 1);
    return invoice;
  }

  async save(invoice: Invoice): Promise<void> {
    await this.invoiceRepository.save(invoice);
  }
}
```
