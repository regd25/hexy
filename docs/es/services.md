### Servicios (Services)

- Ubicación: `/context/<context>/service/`
- Encapsulan lógica del dominio y coordinación de objetos del modelo.
- Deben ser inyectados por los casos de uso (UseCases).
- No deben comunicarse directamente con la infraestructura — solo mediante puertos.

#### ✅ Convención de nombres
- El archivo debe estar en kebab-case y terminar con `.service.ts`
- Ejemplo: `invoice.service.ts`

#### 🧪 Convención de pruebas
- El archivo de prueba debe seguir el patrón: `<nombre>.service.spec.ts`
- Ejemplo: `invoice.service.spec.ts`

#### 🧩 Decorador requerido
- `@Service({ traceable: true })`
  - Aplica automáticamente `@Injectable()` y opcionalmente `@Traceable()`.
  - Permite una sintaxis más limpia y centraliza la metadata.

#### 🧱 Reglas de estructura
- Solo deben recibir dependencias del dominio (puertos, policies, event bus, logger).
- Pueden emitir eventos de dominio o aplicar reglas.
- No deben modificar directamente entidades fuera de sus Aggregates.
- No deben contener lógica de infraestructura.

**Ejemplo:**
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
