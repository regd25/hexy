### Observabilidad

- Ubicación: `/core/observability/`
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
