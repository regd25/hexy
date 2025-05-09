### Observability

- Location: `/@/observability/`
- The system must implement a base class `Telemetry` and multiple adapters.
- Hexy provides decorators to enable tracing automatically.

---

### 🧱 Components

- `Telemetry`: abstract class with methods like `logEvent`, `logMetric`, `logError`
- `InMemoryTelemetry`: test-friendly implementation
- `CloudwatchTelemetry` or `ConsoleTelemetry`: for production environments

---

### 🧩 `@Traceable()` Decorator

- Enables tracing in UseCases, EventHandlers, Services
- Works alongside `Telemetry` injection

---

### 🧪 Testing

- Implementations should be tested via integration
- Decorator can be tested by mocking a class and checking telemetry calls

---

### 🧩 UseCase Example
```ts
@Traceable()
@UseCase({
  summary: 'Register a new user',
  inputSchema: RegisterUserInput,
  outputSchema: UserRegisterOutput
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

### 🧩 Implementation Example
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
