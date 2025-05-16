### Aggregates

- Ubicación: `/context/<context>/aggregate/`
- Un Aggregate representa una unidad de consistencia transaccional del dominio.
- Debe extender de `AggregateRoot`.
- Debe estar decorado con `@Aggregate({ ... })` para registrar su contexto, eventos y comandos.
- Contiene entidades e invariantes internas que solo pueden modificarse desde su raíz.

---

### 🧱 Estructura

- Todos sus campos internos deben ser `private` o `protected`.
- Solo se deben exponer métodos de intención clara.
- No se permiten getters públicos salvo para lectura simple.
- Debe implementar `toPrimitive()` para exponer datos seguros.
- Debe construirse usando Value Objects, no primitivos crudos.
- No debe usarse directamente en capas externas: siempre a través de UseCases o Services.

---

### 🧩 Campos del decorador `@Aggregate({ ... })`

- `context`: (string) obligatorio – nombre del contexto de negocio.
- `events`: (EventClass[]) lista de eventos emitidos por el agregado.
- `commandHandlers`: (InjectionToken[]) lista de comandos que este agregado puede manejar.
- `description`: (string) opcional – texto explicativo para documentación.
- `version`: (string) opcional – por defecto es 'v1'.
- `name`: (string) opcional – si no se define, se deduce del nombre de clase.

> ⚠️ **Los `commandHandlers` deben declararse usando `InjectionToken` definidos dentro del mismo contexto o en `/shared`. Nunca deben importarse desde otro contexto para evitar romper el principio de dependencia del dominio.**

---

### 🧩 Ejemplo
```ts
import { Aggregate } from '@/@/metadata'
import { InvoiceCreated, InvoicePaid } from '../event'
import { COMMANDS } from '../@/command.tokens'

@Aggregate({
  context: 'Billing',
  version: 'v1',
  events: [InvoiceCreated, InvoicePaid],
  commandHandlers: [COMMANDS.GenerateInvoice, COMMANDS.MarkInvoiceAsPaid],
  description: 'Agregado que representa una factura y sus pagos'
})
export class Invoice extends AggregateRoot {
  constructor(
    private readonly id: InvoiceId,
    private readonly amount: Money,
    private readonly date: InvoiceDate
  ) {
    super();
  }

  get total(): number {
    return this.amount.toNumber();
  }

  toPrimitive() {
    return {
      id: this.id.value,
      amount: this.amount.toNumber(),
      date: this.date.toISO()
    }
  }
}
```

### Value Objects (Objetos de Valor)

- Ubicación: `/context/<context>/value-object/`
- Representan conceptos del dominio sin identidad propia.
- Son inmutables, comparables por valor y encapsulan lógica propia.
- Deben estar decorados con `@ValueObject({ ... })` para registrar metadata útil para herramientas o visualización.

---

### 🧱 Reglas de estructura

- Deben ser `readonly` o `private`, sin setters.
- Deben validarse en su constructor o al extender de `ValueObject<T>`.
- Comparan mediante `equals()` u operadores definidos.
- Implementan `toPrimitive()` para exponer su valor.

---

### 🧪 Pruebas

- Archivo de pruebas: `<nombre>.spec.ts`
- Ubicación sugerida: misma carpeta o en `__tests__/`
- Ejemplo: `username.spec.ts`

---

### 🧩 Decorador `@ValueObject({ ... })`

- `context`: (string) obligatorio — indica a qué contexto pertenece el VO.
- `name`: (string) opcional — deducido por defecto del nombre de clase.
- `description`: (string) opcional — útil para documentación.
- `primitive`: (string) opcional — tipo que representa: `string`, `number`, `Date`, etc.

---

### 🧩 Ejemplo
```ts
@ValueObject({
  context: 'User',
  description: 'Nombre de usuario no vacío',
  primitive: 'string'
})
export class Username extends ValueObject<string> {
  protected validate(value: string): void {
    if (!value.trim()) {
      throw new Error('El nombre de usuario no puede estar vacío')
    }
  }
}
```

---

### 🧠 Buenas prácticas

- Nunca deben aceptar o retornar strings crudos sin validar.
- Siempre se construyen explícitamente desde sus UseCases o Services.
- Son ideales para encapsular reglas (Ej. `Money`, `Username`, `Coordinates`, etc.).


### Configuración y Versionado en Hexy

Hexy permite definir parámetros de configuración y secretos sensibles de forma estructurada, permitiendo a los adaptadores cargar valores desde múltiples orígenes.

---

### 🧩 Estructura oficial

Ubicación: `/context/<context>/config/`

#### ✅ Forma preferida (archivos separados)
```
config/
├── parameters.ts  ← parámetros no sensibles
├── secrets.ts     ← claves sensibles
```

#### ✅ Alternativa (todo en uno)
```
config/
├── config.ts      ← debe exportar `parameters` y `secrets`
```

---

### 📁 Ejemplo - parameters.ts

```ts
export const parameters = {
  versioning: true,
  version: 'v2',
  enableFeatureX: true
}
```

---

### 📁 Ejemplo - secrets.ts

```ts
export const secrets = {
  jwtSecret: 'JWT_SECRET',
  dbPassword: 'DB_PASS'
}
```

---

### 🧪 Acceso a valores

```ts
import { parameters } from './parameters'
import { secrets } from './secrets'

const version = parameters.version
const jwt = getSecret(secrets.jwtSecret)
```

---

### 🧩 Adaptadores disponibles

- `.env` (default en desarrollo)
- AWS Parameter Store
- AWS Secrets Manager

---

### 🧠 Buenas prácticas

- Nunca mezcles secretos en `parameters.ts`
- Usa `getSecret()` solo con claves definidas en `secrets.ts`
- Usa `getConfig()` o accede directamente a `parameters` si es plano
- No hardcodees secretos en archivos de dominio o aplicación

### Clase Base: UseCase

La clase `UseCase` define un flujo de ejecución estandarizado para todos los casos de uso dentro de Hexy. Esto permite envolver la lógica central con hooks opcionales como `beforeExecute`, `afterExecute` y `onError`.

Ubicación recomendada: `/src/@/context/use-case/use-case.ts`

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

### ✅ Ventajas
- Permite comportamiento transversal (observabilidad, validación, logging).
- Evita duplicar try/catch en cada implementación.
- Mejora la claridad y extensibilidad del flujo de ejecución.

---

Este patrón es utilizado tanto en `CommandUseCase`, `QueryUseCase` como en `EventHandlerUseCase`, heredando directamente de `UseCase`.

### Casos de Uso (UseCases)

- Ubicación: `/context/<context>/use-case/`
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

### Controladores

- Ubicación: `/context/<context>/adapter/http/controller/<nombre>.controller.ts`
- Actúan como adaptadores entre HTTP y los UseCases.
- Utilizan el decorador `@Controller()` y decoradores de método (`@Get`, `@Post`, etc.).

---

### 🧱 Estructura

- Decorar la clase con `@Controller('/prefix')`
- Decorar métodos con `@Get`, `@Post`, `@Put`, `@Delete`, etc.
- Usar `@Body`, `@Query`, `@Param`, `@Req`, `@Res`, `@Next` para parámetros

---

### 🧪 Pruebas

- Usar HTTP mocks o `supertest`
- Mockear UseCase para aislar lógica
- Archivo de prueba: `<nombre>.controller.spec.ts`
- Ubicación recomendada: misma carpeta del controlador o en `__tests__/`

---

### 🧩 Decorador `@Controller`

- Parámetro `path`: prefijo base de ruta del controlador
- Aplica automáticamente `@Injectable`
- Registra metadata accesible vía `getControllerMetadata`

---

### 🧩 Ejemplo completo
```ts
@Controller('/users')
export class UserController {
  constructor(private readonly useCase: RegisterUserUseCase) {}

  @Post('/')
  async createUser(@Body() input: RegisterUserInput): Promise<SuccessHttpResponse> {
    const user = await this.useCase.execute(input)
    return new SuccessHttpResponse(user)
  }
}
```
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

### Eventos de Dominio

- Ubicación: `/context/<context>/event/`
- Son clases inmutables que representan hechos del dominio.
- Deben extender de `DomainEvent` y estar decorados con `@DomainEvent({ ... })`

---

### 🧱 Reglas

- Inmutables, solo lectura.
- Su constructor define todos los campos.
- Exponen un método `toPrimitive()` para serializarse.

---

### 🧩 Decorador `@DomainEvent({ ... })`

- Campos:
  - `context`: obligatorio
  - `version`: opcional, por defecto `'v1'`
  - `description`: opcional

---

### 🧩 Ejemplo
```ts
@DomainEvent({ context: 'User', description: 'Evento que indica un nuevo usuario registrado' })
export class UserRegistered extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super()
  }

  toPrimitive() {
    return {
      userId: this.userId,
      email: this.email
    }
  }
}
```

---

### Manejadores de Eventos (Event Handlers)

- Ubicación: `/context/<context>/event-handler/`
- Responden a eventos del dominio ejecutando efectos secundarios.
- Deben extender de `BaseEventHandler<Event>` y estar decorados con `@EventHandler(...)`

---

### 🧱 Reglas de estructura

- No retornan datos, solo ejecutan efectos secundarios.
- Solo dependen de servicios del dominio (no acceden a infraestructura directamente).
- Idealmente 1 handler por evento.

---

### 🧪 Pruebas

- Archivo: `<nombre>.event-handler.spec.ts`
- Ubicación: misma carpeta o en `__tests__/`
- Debe simular el evento como entrada y verificar interacciones

---

### 🧩 Decorador `@EventHandler({ ... })`

- Campos:
  - `event`: clase de evento que maneja
  - `traceable`: opcional, para activar telemetría
  - `description`: opcional

---

### 🧩 Ejemplo
```ts
@EventHandler({ event: UserRegistered, traceable: true })
export class SendWelcomeEmail extends BaseEventHandler<UserRegistered> {
  constructor(private readonly mailer: MailerService) {
    super()
  }

  async execute(event: UserRegistered): Promise<void> {
    await this.mailer.send({
      to: event.email,
      subject: '¡Bienvenido!',
      body: 'Gracias por registrarte'
    })
  }
}
```

---

### Factories

- Ubicación: `/context/<context>/factory/`
- Encapsulan la construcción de Aggregates o Entidades complejas.
- Separan la lógica de creación del constructor directo.

---

### 🧱 Reglas

- Solo deben operar con Value Objects o datos primitivos ya validados.
- Nunca deben contener lógica de negocio.
- Nombres claros: `createFromPrimitives`, `createWithDefaults`, `reconstruct`, etc.
- Si requieren dependencias, se permite usar `@Injectable()` para inyectarlas.

---

### 🧪 Pruebas

- Archivo: `<nombre>.factory.spec.ts`
- Ubicación: junto a la implementación o en `__tests__/`

---

### 🧩 Decorador `@Factory`

- Opcional: permite registrar metadata para tooling.
- Campos sugeridos:
  - `context`: obligatorio
  - `target`: agregado o entidad a la que construye
  - `description`: opcional

---

### 🧩 Ejemplo
```ts
@Factory({
  context: 'User',
  target: User,
  description: 'Construye un usuario a partir de datos planos'
})
export class UserFactory {
  static createFromPrimitives(data: UserDTO): User {
    return new User(
      new UserId(data.id),
      new Email(data.email),
      new Username(data.username)
    )
  }
}
```
### Observabilidad

- Ubicación: `/@/observability/`
- El sistema debe implementar una clase base `Telemetry` y múltiples adaptadores.
- Hexy provee decoradores para habilitar trazabilidad automáticamente.

---

### 🧱 Componentes

- `Telemetry`: clase abstracta con métodos como `logEvent`, `logMetric`, `logError`
- `InMemoryTelemetry`: implementación para pruebas
- `CloudwatchTelemetry` o `ConsoleTelemetry`: para entornos reales

---

### 🧩 Decorador `@Traceable()`

- Permite trazar automáticamente la ejecución de UseCases, EventHandlers, Services
- Debe usarse en combinación con `Telemetry`

---

### 🧪 Pruebas

- Las implementaciones deben probarse como integración
- Se puede testear el decorador simulando una clase y verificando si se llama a `logEvent`

---

### 🧩 Ejemplo de uso en UseCase
```ts
@Traceable()
@UseCase({
  summary: 'Registrar nuevo usuario',
  inputSchema: RegisterUserInput,
  outputSchema: UserRegisterOutput
  traceable: false
})
export class RegisterUserUseCase {
  constructor(
    private readonly telemetry: Telemetry,
    private readonly service: UserService
  ) {}

  async execute(input: RegisterUserInput): Promise<UserRegisterOutput> {
    this.telemetry.logEvent('register-user.attempt')
    const user = await this.service.register(input)
    return user.toPrimitive()
  }
}
```

---

### 🧩 Ejemplo de implementación
```ts
export class InMemoryTelemetry extends Telemetry {
  logEvent(name: string): void {
    console.log(`[event]: ${name}`)
  }

  logMetric(name: string, value: number): void {
    console.log(`[metric]: ${name} = ${value}`)
  }

  logError(message: string, stack?: string): void {
    console.error(`[error]: ${message}`, stack)
  }
}
```
### Puertos y Adaptadores

- Hexy implementa el patrón Ports and Adapters como eje central de su arquitectura.
- Los puertos definen contratos abstractos que la infraestructura implementa.
- Se definen en: `/context/<context>/port/`
- Las implementaciones se colocan en: `/context/<context>/adapter/<tipo>/`

---

### 🧭 Tipos comunes de Puertos en Hexy

- Repositorios → ver [repositories.md]
- Adaptadores externos → ej. `EmailSender`, `StorageService`, `PaymentGateway`
- Observabilidad → ver [observability.md]
- EventBus -> `SnsEventBus`, `SqsEventBus`
- Mensajería → `QueueConsumer`, `EventSubscriber`

---

### 🧱 Reglas

- Los puertos son contratos del dominio hacia infraestructura.
- Las implementaciones deben cumplir ese contrato y nunca importar lógica de dominio.
- Se recomienda usar tokens para la inyección.

---

### 🧪 Pruebas

- Pruebas de adaptadores en `adapter/` como integración.
- Mockeo de puertos en pruebas de adaptadores.

---

### 🧩 Decorador `@Port` (en el contrato)

- Opcional, permite registrar el tipo de puerto.
- Campos:
  - `context`: (string) requerido
  - `description`: (string) opcional

---

### 🧩 Decorador `@Adapter` (en la implementación)

- Opcional, usado para identificar el tipo de implementación.
- Campos:
  - `technology`: (string) requerido
  - `for`: clase del puerto que implementa
  - `description`: opcional

---

### 🧩 Ejemplo
```ts
@Port({ context: 'User', description: 'Servicio de envío de correos' })
export interface EmailSender {
  send(data: { to: string; subject: string; body: string }): Promise<void>
}
```

```ts
@Adapter({ technology: 'Sendgrid', for: EmailSender, description: 'Adaptador vía Sendgrid' })
export class SendgridEmailSender implements EmailSender {
  async send(data: { to: string; subject: string; body: string }): Promise<void> {
    // implementación
  }
}
```

### Repositorios

- Abstracción ubicada en: `/context/<context>/repository/`
- Implementaciones en: `/context/<context>/adapter/<db>/`

---

### 🧱 Diseño recomendado

- Extiende de `BaseRepository<T>` para contrato base común.
- Usa `DaoRepository<T>` para implementación concreta con mapeo `toPrimitive`/`fromPrimitives`.
- Decora la implementación con `@Repository({ ... })` para registrar metadatos.
- Inyección mediante token, nunca instanciación directa.

---

### 🧪 Pruebas

- Lógica abstracta: tests en `__tests__/` de dominio (mockeando infraestructura).
- Integración: tests en la carpeta de adapter: `<tecnología>-<nombre>.repository.spec.ts`

---

### 🧩 Decorador `@Repository`

- Se usa en la implementación (no en la abstracción)
- Campos:
  - `entity`: clase de entidad (ej. `User`)
  - `technology`: tipo de tecnología (ej. `'Postgres'`)
  - `context`: nombre del contexto
  - `description`: opcional

---

### 🧩 Ejemplo de abstracción
```ts
export abstract class UserRepository extends BaseRepository<User> {
  abstract findByEmail(email: string): Promise<User | null>
}
```

---

### 🧩 Ejemplo de implementación
```ts
@Repository({
  entity: User,
  technology: 'Postgres',
  context: 'User',
  description: 'Repositorio de usuario con persistencia relacional'
})
export class PostgresUserRepository extends DaoRepository<User> implements UserRepository {
  constructor(private readonly db: PrismaClient) {
    super(User)
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.db.user.findUnique({ where: { email } })
    return data ? User.fromPrimitives(data) : null
  }
}
```

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

### Specifications (Especificaciones)

- Ubicación: `/context/<context>/specification/`
- Encapsulan reglas booleanas reutilizables del dominio.
- No tienen efectos secundarios ni acceden a infraestructura.

---

### 🧱 Reglas

- Implementan el método `isSatisfiedBy(entity: T): boolean`
- Pueden ser combinadas con `and`, `or`, `not` si extienden de clase base `Specification<T>`
- Deben ser puras, testables y sin dependencias externas

---

### 🧪 Pruebas

- Archivo: `<nombre>.spec.ts`
- Ubicación sugerida: `__tests__/` o junto a la implementación
- Debe incluir ejemplos de entidades que cumplen y que no cumplen la condición

---

### 🧩 Decorador `@Specification`

- Ayuda a registrar metadatos para tooling o documentación
- Campos sugeridos:
  - `context`: (string) obligatorio
  - `description`: (string) opcional

---

### 🧩 Ejemplo
```ts
@Specification({ context: 'User', description: 'Verifica si el usuario está activo' })
export class IsActive extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.status === 'active'
  }
}
```

### WebSocket Handler

- Ubicación: `/context/<context>/adapter/ws/handler/`
- Permite manejar eventos entrantes desde WebSocket y delegarlos a UseCases.
- Debe estar decorado con `@WebSocketHandler({ ... })`.

---

### 🧱 Estructura

- Decorar la clase con `@WebSocketHandler({ event })`
- Implementar un método `handle(payload)` o `execute(data)`
- Inyectar servicios o UseCases vía constructor

---

### 🧩 Decorador `@WebSocketHandler`

- Campos:
  - `event`: nombre del evento WebSocket que manejará
  - `context`: requerido
  - `description`: opcional

---

### 🧪 Pruebas

- Archivo: `<nombre>.ws-handler.spec.ts`
- Usar mocks del socket y del UseCase asociado

---

### 🧩 Ejemplo
```ts
@WebSocketHandler({
  event: 'user:typing',
  context: 'Chat',
  description: 'Maneja evento de usuario escribiendo'
})
export class UserTypingHandler {
  constructor(private readonly useCase: MarkUserTypingUseCase) {}

  async execute(payload: { userId: string; roomId: string }) {
    await this.useCase.execute(payload)
  }
}
```

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
