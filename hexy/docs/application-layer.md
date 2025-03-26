# Application Layer

The application layer serves as the coordination layer between the outside world and your domain model. It orchestrates the execution of business logic defined in the domain layer and provides a clear API for the presentation layer or external systems to interact with your application.

## 1. Use Case Implementation

Use cases (or application services) represent the specific actions that can be performed in your application. They encapsulate a single unit of application logic that corresponds to a business operation.

### Structure and Organization

In Hexy, use cases follow a common structure:

```typescript
// src/application/use-cases/create-order.use-case.ts
import { ApplicationService } from '@hexy/core';
import { inject } from '@hexy/di';

import { OrderRepository } from '../../domain/repositories/order.repository';
import { Order } from '../../domain/aggregates/order.aggregate';
import { CustomerId, ProductId } from '../../domain/value-objects';

// Input DTO
export interface CreateOrderInput {
  customerId: string;
  productIds: string[];
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
}

// Output DTO
export interface CreateOrderOutput {
  orderId: string;
  status: string;
  totalAmount: number;
}

@ApplicationService()
export class CreateOrderUseCase {
  constructor(
    @inject(OrderRepository) private orderRepository: OrderRepository,
    @inject(ProductService) private productService: ProductService,
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    // Convert primitive types to domain value objects
    const customerId = new CustomerId(input.customerId);
    const productIds = input.productIds.map(id => new ProductId(id));
    
    // Fetch domain objects and perform business logic
    const products = await this.productService.findByIds(productIds);
    
    // Create the aggregate
    const order = Order.create({
      customerId,
      products,
      shippingAddress: Address.fromPrimitives(input.shippingAddress),
    });
    
    // Save the aggregate
    await this.orderRepository.save(order);
    
    // Return a response DTO
    return {
      orderId: order.id.value,
      status: order.status.value,
      totalAmount: order.totalAmount.value,
    };
  }
}
```

### Best Practices for Use Cases

1. **Single Responsibility**: Each use case should focus on implementing a single business operation.
2. **Input/Output DTOs**: Define clear input and output DTOs to decouple the application layer from external systems.
3. **Thin Layer**: Keep use cases thin; they should orchestrate domain operations, not contain business logic.
4. **Domain Translation**: Convert primitive types from DTOs to domain value objects before interacting with the domain layer.
5. **Error Handling**: Use domain-specific errors and translate them to application-level errors when appropriate.

```typescript
// Error handling in use cases
@ApplicationService()
export class TransferMoneyUseCase {
  async execute(input: TransferMoneyInput): Promise<TransferMoneyOutput> {
    try {
      // Implementation details
    } catch (error) {
      if (error instanceof InsufficientFundsError) {
        throw new ApplicationError('INSUFFICIENT_FUNDS', error.message);
      }
      if (error instanceof AccountNotFoundError) {
        throw new NotFoundError('ACCOUNT_NOT_FOUND', error.message);
      }
      throw error; // Unexpected errors
    }
  }
}
```

## 2. Application Services

Application services are a more general concept than use cases. While use cases represent specific operations, application services can provide a set of related operations or act as facades for domain services.

### Role and Responsibilities

- Orchestrate domain operations and workflow
- Translate between application DTOs and domain objects
- Handle cross-cutting concerns like security, validation, and logging
- Provide a cohesive API for the presentation layer

### Implementation Example

```typescript
// src/application/services/user-management.service.ts
import { ApplicationService } from '@hexy/core';
import { inject } from '@hexy/di';
import { Logger } from '@hexy/logging';

@ApplicationService()
export class UserManagementService {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository,
    @inject(AuthService) private authService: AuthService,
    @inject(Logger) private logger: Logger,
  ) {}

  async registerUser(userData: RegisterUserDto): Promise<UserDto> {
    this.logger.info('Registering new user', { email: userData.email });
    
    // Create domain entity
    const user = User.register({
      email: new Email(userData.email),
      password: await this.authService.hashPassword(userData.password),
      name: new Name(userData.firstName, userData.lastName),
    });
    
    // Save to repository
    await this.userRepository.save(user);
    
    // Send welcome email as a side effect
    await this.sendWelcomeEmail(user);
    
    // Return DTO
    return this.toUserDto(user);
  }
  
  async updateUserProfile(userId: string, profileData: UpdateProfileDto): Promise<UserDto> {
    const user = await this.userRepository.findById(new UserId(userId));
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    user.updateProfile(profileData);
    await this.userRepository.save(user);
    
    return this.toUserDto(user);
  }
  
  private toUserDto(user: User): UserDto {
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name.toString(),
      createdAt: user.createdAt,
    };
  }
  
  private async sendWelcomeEmail(user: User): Promise<void> {
    // Implementation details
  }
}
```

### Transaction Management

Application services often manage transactions to ensure the atomicity of operations:

```typescript
@ApplicationService()
export class OrderProcessingService {
  constructor(
    @inject(TransactionManager) private transactionManager: TransactionManager,
    @inject(OrderRepository) private orderRepository: OrderRepository,
    @inject(PaymentService) private paymentService: PaymentService,
  ) {}

  async processOrder(orderId: string): Promise<void> {
    await this.transactionManager.runInTransaction(async () => {
      const order = await this.orderRepository.findById(new OrderId(orderId));
      
      // Process payment
      const payment = await this.paymentService.processPayment(order);
      
      // Update order status
      order.markAsPaid(payment.id);
      
      // Save changes - this will be committed only if the whole transaction succeeds
      await this.orderRepository.save(order);
    });
  }
}
```

## 3. Command and Query Handling Patterns

The Command Query Responsibility Segregation (CQRS) pattern separates read and write operations, allowing for different optimization strategies and models.

### Command Handling

Commands represent intentions to change the state of the system. They are named with imperative verbs, like `CreateOrder`, `CancelSubscription`, or `UpdateUserProfile`.

```typescript
// src/application/commands/create-order.command.ts
export class CreateOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly items: Array<{ productId: string, quantity: number }>,
    public readonly shippingAddress: Address,
  ) {}
}

// src/application/handlers/create-order.handler.ts
import { CommandHandler, Handle } from '@hexy/cqrs';
import { inject } from '@hexy/di';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler {
  constructor(
    @inject(OrderRepository) private orderRepository: OrderRepository,
    @inject(CustomerRepository) private customerRepository: CustomerRepository,
    @inject(ProductRepository) private productRepository: ProductRepository,
  ) {}
  
  @Handle()
  async handle(command: CreateOrderCommand): Promise<string> {
    // Fetch necessary domain objects
    const customer = await this.customerRepository.findById(new CustomerId(command.customerId));
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    
    const productIds = command.items.map(item => new ProductId(item.productId));
    const products = await this.productRepository.findByIds(productIds);
    
    // Create order using domain logic
    const order = customer.createOrder(
      products,
      command.items.map(item => item.quantity),
      command.shippingAddress
    );
    
    // Persist
    await this.orderRepository.save(order);
    
    // Return the ID
    return order.id.value;
  }
}
```

### Query Handling

Queries retrieve data without modifying the system state. They often bypass the domain layer for performance reasons, especially for read-heavy operations.

```typescript
// src/application/queries/get-order-summary.query.ts
export class GetOrderSummaryQuery {
  constructor(
    public readonly orderId: string,
  ) {}
}

// src/application/handlers/get-order-summary.handler.ts
import { QueryHandler, Handle } from '@hexy/cqrs';
import { inject } from '@hexy/di';

@QueryHandler(GetOrderSummaryQuery)
export class GetOrderSummaryHandler {
  constructor(
    @inject(OrderReadModel) private orderReadModel: OrderReadModel,
  ) {}
  
  @Handle()
  async handle(query: GetOrderSummaryQuery): Promise<OrderSummaryDto> {
    // Direct query to the read model (could be a separate database)
    return this.orderReadModel.getOrderSummary(query.orderId);
  }
}
```

### Command Bus and Query Bus

Hexy provides a command bus and query bus infrastructure that decouples the sending of commands/queries from their handlers:

```typescript
// Using the command bus in a controller
@Controller('/orders')
export class OrderController {
  constructor(
    @inject(CommandBus) private commandBus: CommandBus,
    @inject(QueryBus) private queryBus: QueryBus,
  ) {}
  
  @Post('/')
  async createOrder(@Body() body: CreateOrderRequestDto): Promise<CreateOrderResponseDto> {
    // Send command to command bus, which routes it to the appropriate handler
    const orderId = await this.commandBus.execute(
      new CreateOrderCommand(body.customerId, body.items, body.shippingAddress)
    );
    
    return { orderId };
  }
  
  @Get('/:id')
  async getOrder(@Param('id') orderId: string): Promise<OrderSummaryDto> {
    // Send query to query bus
    return this.queryBus.execute(new GetOrderSummaryQuery(orderId));
  }
}
```

### Best Practices for CQRS

1. **Separate Read and Write Models**: Use different data models for read and write operations when appropriate.

2. **Denormalization for Queries**: Denormalize data in read models to optimize query performance.

3. **Eventual Consistency**: When using separate read and write databases, accept that they will be eventually consistent.

4. **Command Validation**: Validate commands before they are handled to fail fast.

```typescript
// Command validation
@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler {
  @Handle()
  async handle(command: UpdateProfileCommand): Promise<void> {
    // Validate command
    const validator = new UpdateProfileValidator();
    const validationResult = validator.validate(command);
    
    if (!validationResult.isValid) {
      throw new ValidationError('Invalid command', validationResult.errors);
    }
    
    // Handle command if validation passes
    // ...
  }
}
```

## Integrating Application Layer with Other Layers

### With Domain Layer

The application layer should:
- Translate input to domain objects
- Invoke domain operations
- Persist domain changes
- Translate domain output to DTOs

### With Infrastructure Layer

The application layer interfaces with:
- Repositories for persistence
- External services via adapters
- Event buses for publishing and subscribing to events
- Logging and monitoring

### With Presentation Layer

The application layer exposes:
- Use cases to be invoked from controllers
- Application services for more complex operations
- Commands and queries for CQRS-based architectures

## Conclusion

The application layer plays a crucial role in orchestrating the business logic defined in the domain layer. By separating use cases, implementing proper command and query handling, and following best practices for application services, you can maintain a clean architecture that is both flexible and maintainable.

Remember that the application layer should remain focused on coordination rather than containing business logic. This ensures that your domain model remains pure and reusable across different use cases and applications.

