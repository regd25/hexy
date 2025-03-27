# Dependency Injection System

Hexy provides a powerful, type-safe dependency injection system that helps manage components and their relationships throughout your application. This document outlines the key features and usage patterns of the DI system.

## 1. Container and Module System

The container is the central registry that manages all dependencies in your application. Modules help organize related dependencies into cohesive groups.

### Creating a Module

```typescript
import { Module } from '@hexy/core';
import { UserRepository } from './repositories/UserRepository';
import { UserService } from './services/UserService';

@Module({
  providers: [
    UserRepository,
    UserService
  ],
  exports: [
    UserService
  ]
})
export class UserModule {}
```

### Registering Modules with the Container

```typescript
import { Container } from '@hexy/core';
import { UserModule } from './modules/UserModule';
import { OrderModule } from './modules/OrderModule';

async function bootstrap() {
  const container = new Container();
  
  // Register modules
  container.registerModule(UserModule);
  container.registerModule(OrderModule);
  
  // Initialize the container
  await container.initialize();
  
  return container;
}
```

### Manual Registration

You can also register dependencies manually:

```typescript
import { Container } from '@hexy/core';
import { Logger } from './services/Logger';
import { ConfigService } from './services/ConfigService';

const container = new Container();

// Register individual services
container.register(Logger);
container.register(ConfigService, {
  useFactory: () => new ConfigService(process.env.NODE_ENV)
});
```

## 2. Layer-Specific Decorators

Hexy provides specialized decorators to clearly indicate the architectural layer a service belongs to.

### Domain Layer Decorators

```typescript
import { DomainService, Entity, ValueObject } from '@hexy/core';

@DomainService()
export class ProductPricingService {
  calculateDiscount(product: Product, quantity: number): number {
    // Domain logic for calculating discounts
  }
}

@Entity()
export class Product {
  // Entity implementation
}

@ValueObject()
export class Money {
  // Value object implementation
}
```

### Application Layer Decorators

```typescript
import { ApplicationService, CommandHandler, QueryHandler } from '@hexy/core';

@ApplicationService()
export class OrderApplicationService {
  constructor(private orderRepository: OrderRepository) {}
  
  async createOrder(data: CreateOrderDto): Promise<OrderDto> {
    // Application logic
  }
}

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler {
  // Command handler implementation
}

@QueryHandler(GetOrderQuery)
export class GetOrderQueryHandler {
  // Query handler implementation
}
```

### Infrastructure Layer Decorators

```typescript
import { Repository, HttpController, EventSubscriber } from '@hexy/core';

@Repository()
export class PostgresUserRepository implements UserRepository {
  // Repository implementation
}

@HttpController('/users')
export class UserController {
  // Controller implementation
}

@EventSubscriber()
export class UserEventSubscriber {
  // Event subscriber implementation
}
```

## 3. Lifecycle Management

Hexy's DI container manages the lifecycle of all registered components, providing hooks for initialization and cleanup.

### Component Initialization

```typescript
import { Injectable, OnInit, OnDestroy } from '@hexy/core';
import { DatabaseConnection } from './infrastructure/DatabaseConnection';

@Injectable()
export class DatabaseService implements OnInit, OnDestroy {
  private connection: DatabaseConnection;
  
  constructor(private config: ConfigService) {}
  
  // Called automatically after the instance is created
  async onInit(): Promise<void> {
    this.connection = new DatabaseConnection(
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT')
    );
    await this.connection.connect();
    console.log('Database connection established');
  }
  
  // Called during container shutdown
  async onDestroy(): Promise<void> {
    await this.connection.disconnect();
    console.log('Database connection closed');
  }
  
  query(sql: string): Promise<any[]> {
    return this.connection.query(sql);
  }
}
```

### Container Lifecycle

```typescript
async function bootstrap() {
  const container = new Container();
  
  // Register components
  container.registerModule(AppModule);
  
  try {
    // Initialize all components (calls onInit on each)
    await container.initialize();
    
    // Application runs here...
    
    // Gracefully shut down (calls onDestroy on each component)
    await container.shutdown();
  } catch (error) {
    console.error('Error during container lifecycle:', error);
    process.exit(1);
  }
}
```

## 4. Component Scanning

Hexy can automatically discover and register components based on decorators, reducing the need for manual registration.

### Enabling Component Scanning

```typescript
import { Container, scanComponents } from '@hexy/core';

async function bootstrap() {
  // Scan for components in these directories
  const components = await scanComponents([
    './src/domain',
    './src/application',
    './src/infrastructure'
  ]);
  
  const container = new Container();
  
  // Register all discovered components
  components.forEach(component => {
    container.register(component);
  });
  
  await container.initialize();
  
  return container;
}
```

### Using Component Scanner with Modules

```typescript
import { Module, scanComponents } from '@hexy/core';

@Module({
  imports: [CommonModule],
  providers: [], // Will be populated by scanning
})
export class AppModule {
  static async register() {
    const components = await scanComponents('./src/app/**/*.ts');
    
    return {
      module: AppModule,
      providers: components
    };
  }
}

// Usage
const appModule = await AppModule.register();
container.registerModule(appModule);
```

## 5. Type-Safe Dependency Resolution

Hexy's DI system leverages TypeScript's type system to provide type-safe dependency resolution.

### Injection Tokens

```typescript
import { Injectable, InjectionToken } from '@hexy/core';

// Create a token for a configuration object
export const CONFIG_TOKEN = new InjectionToken<AppConfig>('APP_CONFIG');

// Register a value with a token
container.register({
  provide: CONFIG_TOKEN,
  useValue: {
    apiUrl: 'https://api.example.com',
    timeout: 5000
  }
});

// Inject using the token
@Injectable()
export class ApiService {
  constructor(@Inject(CONFIG_TOKEN) private config: AppConfig) {}
  
  async fetchData() {
    return fetch(`${this.config.apiUrl}/data`, {
      timeout: this.config.timeout
    });
  }
}
```

### Interface Injection

```typescript
import { Injectable, provide } from '@hexy/core';

// Define an interface
interface Logger {
  log(message: string): void;
  error(message: string, error?: Error): void;
}

// Implement the interface
@Injectable()
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[INFO] ${message}`);
  }
  
  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }
}

// Register the implementation
container.register({
  provide: 'Logger', // String token for the interface
  useClass: ConsoleLogger
});

// Use the interface in a service
@Injectable()
class UserService {
  constructor(@Inject('Logger') private logger: Logger) {}
  
  createUser(userData: any) {
    this.logger.log('Creating new user');
    // User creation logic
  }
}
```

### Error Handling

Hexy provides clear error messages when dependency resolution fails:

```typescript
import { Injectable, Container } from '@hexy/core';

@Injectable()
class UserService {
  constructor(private repository: UserRepository) {}
  
  // Implementation
}

// If UserRepository is not registered
try {
  const container = new Container();
  container.register(UserService);
  const userService = container.resolve(UserService); // Throws error
} catch (error) {
  console.error(error.message);
  // Output: "Failed to resolve dependency 'UserRepository' for 'UserService'. 
  // Make sure 'UserRepository' is registered in the container."
}
```

### Circular Dependency Detection

```typescript
import { Injectable } from '@hexy/core';

@Injectable()
class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
class ServiceB {
  constructor(private serviceA: ServiceA) {}
}

// When resolving either service:
// Error: Circular dependency detected: ServiceA -> ServiceB -> ServiceA
```

## Conclusion

Hexy's Dependency Injection system provides a robust foundation for building modular, testable, and maintainable applications. By properly leveraging the container, modules, decorators, and type-safe dependency resolution, you can create a clean architecture that respects domain boundaries and supports the principles of DDD and Hexagonal Architecture.

