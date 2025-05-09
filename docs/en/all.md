### Aggregates

- Location: `/context/<context>/aggregate/`
- An Aggregate represents a transactional consistency unit of the domain.
- Must extend from `AggregateRoot`.
- Must be decorated with `@Aggregate({ ... })` to register its context, events, and commands.
- Contains internal entities and invariants that can only be modified from its root.

---

### 🧱 Structure

- All internal fields must be `private` or `protected`.
- Only clear intention methods should be exposed.
- Public getters are not allowed except for simple reading.
- Must implement `toPrimitive()` to expose safe data.
- Must be built using Value Objects, not raw primitives.
- Should not be used directly in external layers: always through UseCases or Services.

---

### 🧩 `@Aggregate({ ... })` decorator fields

- `context`: (string) required – business context name.
- `events`: (EventClass[]) list of events emitted by the aggregate.
- `commandHandlers`: (InjectionToken[]) list of commands this aggregate can handle.
- `description`: (string) optional – explanatory text for documentation.
- `version`: (string) optional – defaults to 'v1'.
- `name`: (string) optional – if not defined, deduced from class name.

> ⚠️ **`commandHandlers` must be declared using `InjectionToken` defined within the same context or in `/shared`. They should never be imported from another context to avoid breaking the domain dependency principle.**

---

### 🧩 Example
```ts
import { Aggregate } from '@/@/metadata'
import { InvoiceCreated, InvoicePaid } from '../event'
import { COMMANDS } from '../@/command.tokens'

@Aggregate({
  context: 'Billing',
  version: 'v1',
  events: [InvoiceCreated, InvoicePaid],
  commandHandlers: [COMMANDS.GenerateInvoice, COMMANDS.MarkInvoiceAsPaid],
  description: 'Aggregate representing an invoice and its payments'
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

### Value Objects

- Location: `/context/<context>/value-object/`
- Represent domain concepts without identity.
- Are immutable, comparable by value, and encapsulate their own logic.
- Must be decorated with `@ValueObject({ ... })` to register metadata useful for tools or visualization.

---

### 🧱 Structure rules

- Must be `readonly` or `private`, without setters.
- Must validate in constructor or when extending `PrimitiveValueObject<T>`.
- Compare using `equals()` or defined operators.
- Implement `toPrimitive()` to expose their value.

---

### 🧪 Testing

- Test file: `<name>.spec.ts`
- Suggested location: same folder or in `__tests__/`
- Example: `username.spec.ts`

---

### 🧩 `@ValueObject({ ... })` decorator

- `context`: (string) required — indicates which context the VO belongs to.
- `name`: (string) optional — deduced by default from class name.
- `description`: (string) optional — useful for documentation.
- `primitive`: (string) optional — type it represents: `string`, `number`, `Date`, etc.

---

### 🧩 Example
```ts
@ValueObject({
  context: 'User',
  description: 'Non-empty username',
  primitive: 'string'
})
export class Username extends PrimitiveValueObject<string> {
  protected validate(value: string): void {
    if (!value.trim()) {
      throw new Error('Username cannot be empty')
    }
  }
}
```

---

### 🧠 Best practices

- Should never accept or return raw strings without validation.
- Should always be explicitly constructed from their UseCases or Services.
- Ideal for encapsulating rules (e.g., `Money`, `Username`, `Coordinates`, etc.).

### Configuration and Versioning in Hexy

Hexy allows defining configuration parameters and sensitive secrets in a structured way, enabling adapters to load values from multiple sources.

---

### 🧩 Official structure

Location: `/context/<context>/config/`

#### ✅ Preferred way (separate files)
```
config/
├── parameters.ts  ← non-sensitive parameters
├── secrets.ts     ← sensitive keys
```

#### ✅ Alternative (all in one)
```
config/
├── config.ts      ← must export `parameters` and `secrets`
```

---

### 📁 Example - parameters.ts

```ts
export const parameters = {
  versioning: true,
  version: 'v2',
  enableFeatureX: true
}
```

---

### 📁 Example - secrets.ts

```ts
export const secrets = {
  jwtSecret: 'JWT_SECRET',
  dbPassword: 'DB_PASS'
}
```

---

### 🧪 Accessing values

```ts
import { parameters } from './parameters'
import { secrets } from './secrets'

const version = parameters.version
const jwt = getSecret(secrets.jwtSecret)
```

---

### 🧩 Available adapters

- `.env` (default in development)
- AWS Parameter Store
- AWS Secrets Manager

---

### 🧠 Best practices

- Never mix secrets in `parameters.ts`
- Use `getSecret()` only with keys defined in `secrets.ts`
- Use `getConfig()` or access `parameters` directly if flat
- Do not hardcode secrets in domain or application files

### Base Class: UseCase

The `UseCase` class defines a standardized execution flow for all use cases within Hexy. This allows wrapping the core logic with optional hooks like `beforeExecute`, `afterExecute`, and `onError`.

Recommended location: `/src/@/context/use-case/use-case.ts`

---

### 🔁 UseCase Lifecycle

1. **`run(input)`**: public entry point, executes the complete cycle.
2. **`beforeExecute(input)`**: optional hook before main logic.
3. **`execute(input)`**: main logic, must be implemented.
4. **`afterExecute(output)`**: optional hook after execution.
5. **`onError(error, input)`**: error handling hook.

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

### ✅ Advantages
- Enables cross-cutting behavior (observability, validation, logging).
- Avoids duplicating try/catch in each implementation.
- Improves clarity and extensibility of execution flow.

---

This pattern is used in `CommandUseCase`, `QueryUseCase`, and `EventHandlerUseCase`, all inheriting directly from `UseCase`.

### Use Cases

- Location: `/context/<context>/use-case/`
- Each UseCase must be a class extending one of the following types:
  - `CommandUseCase<Input, Output>` — for operations that modify state.
  - `QueryUseCase<Input, Output>` — for queries without side effects.
  - `EventHandler<Event>` — for cases responding to domain events.

#### ✅ Naming convention
- File suffix: `.usecase.ts`
- Example: `generate-invoice.usecase.ts`

#### 🧪 Test convention
- Test file: `<name>.usecase.spec.ts`
- Example: `generate-invoice.usecase.spec.ts`

#### 🧩 Required decorator
- `@UseCase({ summary, inputSchema, outputSchema, tags })`
  - Automatically applies `@Traceable` and `@DescribeUseCase`.

#### 🧱 Structure rules
- Constructor only with domain dependencies.
- The `execute()` method must:
  - Return primitives, DTOs, or Result<T>.
  - Never return domain entities directly.
  - Throw `AppError` or return a safe result.

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
  summary: 'Queries invoices for the current month',
  inputSchema: GetMonthlyInvoicesInput,
  outputSchema: GetMonthlyInvoicesOutput,
  tags: ['billing']
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

### Controllers

- Location: `/context/<context>/adapter/http/controller/<name>.controller.ts`
- Act as adapters between HTTP and UseCases.
- Use the `@Controller()` decorator and method decorators (`@Get`, `@Post`, etc.).

---

### 🧱 Structure

- Decorate class with `@Controller('/prefix')`
- Decorate methods with `@Get`, `@Post`, `@Put`, `@Delete`, etc.
- Use `@Body`, `@Query`, `@Param`, `@Req`, `@Res`, `@Next` for parameters

---

### 🧪 Testing

- Use HTTP mocks or `supertest`
- Mock UseCase to isolate logic
- Test file: `<name>.controller.spec.ts`
- Recommended location: same folder as controller or in `__tests__/`

---

### 🧩 `@Controller` decorator

- `path` parameter: base route prefix for controller
- Automatically applies `@Injectable`
- Registers metadata accessible via `getControllerMetadata`

---

### 🧩 Complete example
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

### Decorators and Documentation

Hexy uses decorators as a central point for registering structured metadata. This enables automatic generation of documentation, diagrams, and tools like Agrovisual.

---

### 🎯 Available decorators

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

### 🧱 Conventions

- All must include at least the `context` field.
- None should produce side effects.
- Only register metadata accessible by tooling.

---

### 🧩 Combined example

```ts
@Traceable()
@UseCase({
  context: 'Billing',
  summary: 'Generates an invoice',
  inputSchema: GenerateInvoiceInput,
  outputSchema: GenerateInvoiceOutput
})
export class GenerateInvoiceUseCase extends CommandUseCase<GenerateInvoiceInput, GenerateInvoiceOutput> {
  // ...
}
```

---

### 🛠 Automatic generation

Hexy can use these decorators to build:

- Use case documentation
- Event and aggregate diagrams
- Port and adapter relationships
- Index of ValueObjects, errors, commands, specs

---

### 🧪 Testing

- Decorators should be tested as pure functions.
- Use dummy classes and `Reflect.getMetadata` to validate.

### Domain Events

- Location: `/context/<context>/event/`
- Are immutable classes representing domain facts.
- Must extend `DomainEvent` and be decorated with `@DomainEvent({ ... })`

---

### 🧱 Rules

- Immutable, read-only.
- Constructor defines all fields.
- Expose a `toPrimitive()` method for serialization.

---

### 🧩 `@DomainEvent({ ... })` decorator

- Fields:
  - `context`: required
  - `version`: optional, defaults to `'v1'`
  - `description`: optional

---

### 🧩 Example
```ts
@DomainEvent({ context: 'User', description: 'Event indicating a new user registration' })
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

### Event Handlers

- Location: `/context/<context>/event-handler/`
- Respond to domain events by executing side effects.
- Must extend `BaseEventHandler<Event>` and be decorated with `@EventHandler(...)`

---

### 🧱 Structure rules

- Do not return data, only execute side effects.
- Only depend on domain services (do not access infrastructure directly).
- Ideally 1 handler per event.

---

### 🧪 Testing

- File: `<name>.event-handler.spec.ts`
- Location: same folder or in `__tests__/`
- Must simulate event as input and verify interactions

---

### 🧩 `@EventHandler({ ... })` decorator

- Fields:
  - `event`: event class it handles
  - `traceable`: optional, to enable telemetry
  - `description`: optional

---

### 🧩 Example
```ts
@EventHandler({ event: UserRegistered, traceable: true })
export class SendWelcomeEmail extends BaseEventHandler<UserRegistered> {
  constructor(private readonly mailer: MailerService) {
    super()
  }

  async execute(event: UserRegistered): Promise<void> {
    await this.mailer.send({
      to: event.email,
      subject: 'Welcome!',
      body: 'Thank you for registering'
    })
  }
}
```

---

### Factories

- Location: `/context/<context>/factory/`
- Encapsulate construction of Aggregates or complex Entities.
- Separate creation logic from direct constructor.

---

### 🧱 Rules

- Should only operate with Value Objects or already validated primitive data.
- Should never contain business logic.
- Clear names: `createFromPrimitives`, `createWithDefaults`, `reconstruct`, etc.
- If dependencies are required, `@Injectable()` can be used to inject them.

---

### 🧪 Testing

- File: `<name>.factory.spec.ts`
- Location: alongside implementation or in `__tests__/`

---

### 🧩 `@Factory` decorator

- Optional: allows registering metadata for tooling.
- Suggested fields:
  - `context`: required
  - `target`: aggregate or entity it builds
  - `description`: optional

---

### 🧩 Example
```ts
@Factory({
  context: 'User',
  target: User,
  description: 'Builds a user from flat data'
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

### Observability

- Location: `/@/observability/`
- System must implement a base `Telemetry` class and multiple adapters.
- Hexy provides decorators to automatically enable traceability.

---

### 🧱 Components

- `Telemetry`: abstract class with methods like `logEvent`, `logMetric`, `logError`
- `InMemoryTelemetry`: implementation for testing
- `CloudwatchTelemetry` or `ConsoleTelemetry`: for real environments

---

### 🧩 `@Traceable()` decorator

- Allows automatic tracing of UseCases, EventHandlers, Services execution
- Must be used in combination with `Telemetry`

---

### 🧪 Testing

- Implementations should be tested as integration
- Decorator can be tested by simulating a class and verifying if `logEvent` is called

---

### 🧩 Example usage in UseCase
```ts
@Traceable()
@UseCase({
  summary: 'Register new user',
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

### 🧩 Implementation example
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

### Ports and Adapters

- Hexy implements the Ports and Adapters pattern as the central axis of its architecture.
- Ports define abstract contracts that infrastructure implements.
- Defined in: `/context/<context>/port/`
- Implementations placed in: `/context/<context>/adapter/<type>/`

---

### 🧭 Common Port types in Hexy

- Repositories → see [repositories.md]
- External adapters → e.g., `EmailSender`, `StorageService`, `PaymentGateway`
- Observability → see [observability.md]
- EventBus -> `SnsEventBus`, `SqsEventBus`
- Messaging → `QueueConsumer`, `EventSubscriber`

---

### 🧱 Rules

- Ports are domain contracts towards infrastructure.
- Implementations must fulfill that contract and never import domain logic.
- Token usage is recommended for injection.

---

### 🧪 Testing

- Adapter tests in `adapter/` as integration.
- Port mocking in domain or application tests.

---

### 🧩 `@Port` decorator (in contract)

- Optional, allows registering port type.
- Fields:
  - `context`: (string) required
  - `description`: (string) optional

---

### 🧩 `@Adapter` decorator (in implementation)

- Optional, used to identify implementation type.
- Fields:
  - `technology`: (string) required
  - `for`: port class it implements
  - `description`: optional

---

### 🧩 Example
```ts
@Port({ context: 'User', description: 'Email sending service' })
export interface EmailSender {
  send(data: { to: string; subject: string; body: string }): Promise<void>
}
```

```ts
@Adapter({ technology: 'Sendgrid', for: EmailSender, description: 'Sendgrid adapter' })
export class SendgridEmailSender implements EmailSender {
  async send(data: { to: string; subject: string; body: string }): Promise<void> {
    // implementation
  }
}
```

### Repositories

- Abstraction located in: `/context/<context>/repository/`
- Implementations in: `/context/<context>/adapter/<db>/`

---

### 🧱 Recommended design

- Extend `BaseRepository<T>` for common base contract.
- Use `DaoRepository<T>` for concrete implementation with `toPrimitive`/`fromPrimitives` mapping.
- Decorate implementation with `@Repository({ ... })` to register metadata.
- Injection via token, never direct instantiation.

---

### 🧪 Testing

- Abstract logic: tests in domain's `__tests__/` (mocking infrastructure).
- Integration: tests in adapter folder: `<technology>-<name>.repository.spec.ts`

---

### 🧩 `@Repository` decorator

- Used in implementation (not in abstraction)
- Fields:
  - `entity`: entity class (e.g., `User`)
  - `technology`: technology type (e.g., `'Postgres'`)
  - `context`: context name
  - `description`: optional

---

### 🧩 Abstraction example
```ts
export abstract class UserRepository extends BaseRepository<User> {
  abstract findByEmail(email: string): Promise<User | null>
}
```

---

### 🧩 Implementation example
```ts
@Repository({
  entity: User,
  technology: 'Postgres',
  context: 'User',
  description: 'User repository with relational persistence'
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

### Services

- Location: `/context/<context>/service/`
- Encapsulate domain logic and model object coordination.
- Must be injected by use cases (UseCases).
- Should not communicate directly with infrastructure — only through ports.

#### ✅ Naming convention
- File must be in kebab-case and end with `.service.ts`
- Example: `invoice.service.ts`

#### 🧪 Test convention
- Test file must follow pattern: `<name>.service.spec.ts`
- Example: `invoice.service.spec.ts`

#### 🧩 Required decorator
- `@Service({ traceable: true })`
  - Automatically applies `@Injectable()` and optionally `@Traceable()`.
  - Enables cleaner syntax and centralizes metadata.

#### 🧱 Structure rules
- Should only receive domain dependencies (ports, policies, event bus, logger).
- Can emit domain events or apply rules.
- Should not modify entities directly outside their Aggregates.
- Should not contain infrastructure logic.

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

### Specifications

- Location: `/context/<context>/specification/`
- Encapsulate reusable boolean rules of the domain.
- Have no side effects and do not access infrastructure.

---

### 🧱 Rules

- Implement the `isSatisfiedBy(entity: T): boolean` method
- Can be combined with `and`, `or`, `not` if extending base class `Specification<T>`
- Must be pure, testable and without external dependencies

---

### 🧪 Testing

- File: `<name>.spec.ts`
- Suggested location: `__tests__/` or alongside implementation
- Must include examples of entities that satisfy and do not satisfy the condition

---

### 🧩 `@Specification` decorator

- Helps register metadata for tooling or documentation
- Suggested fields:
  - `context`: (string) required
  - `description`: (string) optional

---

### 🧩 Example
```ts
@Specification({ context: 'User', description: 'Verifies if user is active' })
export class IsActive extends Specification<User> {
  isSatisfiedBy(user: User): boolean {
    return user.status === 'active'
  }
}
```

### WebSocket Handler

- Location: `/context/<context>/adapter/ws/handler/`
- Allows handling incoming WebSocket events and delegating them to UseCases.
- Must be decorated with `@WebSocketHandler({ ... })`.

---

### 🧱 Structure

- Decorate class with `@WebSocketHandler({ event })`
- Implement a `handle(payload)` or `execute(data)` method
- Inject services or UseCases via constructor

---

### 🧩 `@WebSocketHandler` decorator

- Fields:
  - `event`: WebSocket event name it will handle
  - `context`: required
  - `description`: optional

---

### 🧪 Testing

- File: `<name>.ws-handler.spec.ts`
- Use socket and associated UseCase mocks

---

### 🧩 Example
```ts
@WebSocketHandler({
  event: 'user:typing',
  context: 'Chat',
  description: 'Handles user typing event'
})
export class UserTypingHandler {
  constructor(private readonly useCase: MarkUserTypingUseCase) {}

  async execute(payload: { userId: string; roomId: string }) {
    await this.useCase.execute(payload)
  }
}
```

### Testing Strategy in Hexy

Hexy promotes layered testing to ensure stability, traceability, and confidence in the architecture.

---

### 🧪 Test types by component

#### ✅ Value Objects / Entities
- Pure unit tests
- Comparison, validation, toPrimitive()

#### ✅ Aggregates
- Invariant validation
- Behavior methods
- `toPrimitive()` and `applyEvent()` methods if applicable

#### ✅ Services
- Business flow unit tests
- Repository or dependency mocks

#### ✅ UseCases
- Complete orchestration
- Service, repo and eventBus mocks
- Execute via `.run(input)` or `.execute(input)`

#### ✅ EventHandlers
- Input = event
- Verify side effects
- Should not return values

#### ✅ Factories
- Return correctly built entities or aggregates
- Simulate valid data and edge cases

#### ✅ Specifications
- Verify boolean rules
- `isSatisfiedBy` must return true/false based on input

#### ✅ Repositories (abstract)
- Mocked in Services and UseCases tests
- Test integration through Adapter tests

#### ✅ Adapters
- Real integration tests
- HTTP, S3, DB, WebSocket, email, etc.

#### ✅ Controllers / WebSocketHandlers
- Simulate input (HTTP or socket)
- Verify expected output and UseCase invocation

---

### 📁 Standard location

- Tests alongside files or in `/__tests__/`
- File name: `<name>.spec.ts` or `<name>.<type>.spec.ts`

---

### 🧩 Tools

- `jest`, `supertest`, `faker`

---

### 📌 Best practices

- One test per scenario
- Use controlled mocks, not empty mocks
- Do not mock domain logic
- Keep unit tests separate from integration tests

---

This document applies to all modules defined in Hexy. 