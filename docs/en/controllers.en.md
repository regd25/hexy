### Controllers

- Location: `/context/<context>/adapter/http/controller/<name>.controller.ts`
- Serve as adapters between HTTP and UseCases.
- Use the `@Controller()` decorator and HTTP method decorators (`@Get`, `@Post`, etc.).

---

### 🧱 Structure

- Decorate the class with `@Controller('/prefix')`
- Decorate methods with `@Get`, `@Post`, `@Put`, `@Delete`, etc.
- Use `@Body`, `@Query`, `@Param`, `@Req`, `@Res`, `@Next` to extract parameters

---

### 🧪 Testing

- Use HTTP mocks or `supertest`
- Mock the UseCase to isolate logic
- Test file name: `<name>.controller.spec.ts`
- Recommended location: same folder or under `__tests__/`

---

### 🧩 `@Controller` Decorator

- Parameter `path`: base route prefix of the controller
- Automatically applies `@Injectable`
- Stores metadata accessible via `getControllerMetadata`

---

### 🧩 Full Example
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
