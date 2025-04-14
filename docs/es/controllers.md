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
