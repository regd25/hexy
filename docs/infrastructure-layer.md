# Infrastructure Layer

The infrastructure layer in Hexy implements all the technical details needed to connect your domain and application layers to the outside world. This layer is responsible for HTTP communications, event messaging, data persistence, and observability.

## Table of Contents

1. [HTTP Adapters](#http-adapters)
2. [Event Bus Implementations](#event-bus-implementations)
3. [Persistence Infrastructure](#persistence-infrastructure)
4. [Telemetry and Observability](#telemetry-and-observability)

## HTTP Adapters

Hexy provides a clean way to expose your application's functionality through HTTP APIs, with an Express implementation that handles controllers, routes, and request/response processing.

### Controllers and Routing

Controllers in Hexy are decorated classes that map HTTP requests to application use cases.

```typescript
import { Controller, Get, Post, Body, Param } from '@hexy/http';
import { UserService } from '../../application/services/UserService';
import { CreateUserDto } from '../dto/CreateUserDto';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getAllUsers() {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return { user };
  }

  @Post('/')
  async createUser(@Body() userData: CreateUserDto) {
    const newUser = await this.userService.createUser(userData);
    return { user: newUser };
  }
}
```

### Request Validation

You can implement request validation using the built-in validation system:

```typescript
import { IsString, IsEmail, Length } from '@hexy/validation';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 100)
  password: string;
}
```

### Middleware Integration

Middleware can be applied at the controller or route level:

```typescript
import { Controller, Get, UseMiddleware } from '@hexy/http';
import { authMiddleware, loggerMiddleware } from '../middleware';

@Controller('/secure')
@UseMiddleware(authMiddleware)
export class SecureController {
  @Get('/profile')
  @UseMiddleware(loggerMiddleware)
  async getProfile(@Req() request) {
    const userId = request.user.id;
    // ... retrieve user profile logic
    return { profile: userProfile };
  }
}
```

### Error Handling

HTTP adapters can catch and transform errors into appropriate HTTP responses:

```typescript
import { Controller, Get, HttpException } from '@hexy/http';
import { UserNotFoundError } from '../../domain/errors/UserNotFoundError';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.userService.findById(id);
      return { user };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new HttpException(404, 'User not found');
      }
      throw new HttpException(500, 'Internal server error');
    }
  }
}
```

### Bootstrap Example

To set up the HTTP server:

```typescript
import { HttpServer } from '@hexy/http';
import { Container } from '@hexy/core';

async function bootstrap() {
  const container = Container.getInstance();
  await container.initialize();
  
  const httpServer = container.resolve(HttpServer);
  await httpServer.start({
    port: 3000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    bodyParser: {
      json: { limit: '10mb' }
    }
  });
  
  console.log('Server started on port 3000');
}

bootstrap().catch(console.error);
```

## Event Bus Implementations

Hexy offers multiple event bus implementations to support different scenarios and scalability requirements.

### In-Memory Event Bus

The simplest implementation for local development and testing:

```typescript
import { Module } from '@hexy/core';
import { InMemoryEventBusModule } from '@hexy/events';

@Module({
  imports: [
    InMemoryEventBusModule.register()
  ]
})
export class AppModule {}
```

### Redis Event Bus

For distributed systems requiring reliable messaging:

```typescript
import { Module } from '@hexy/core';
import { RedisEventBusModule } from '@hexy/events-redis';

@Module({
  imports: [
    RedisEventBusModule.register({
      host: 'localhost',
      port: 6379,
      password: 'optional-password',
      keyPrefix: 'hexy:events:',
      retryAttempts: 3
    })
  ]
})
export class AppModule {}
```

### AWS SQS/SNS Event Bus

For cloud-native applications running on AWS:

```typescript
import { Module } from '@hexy/core';
import { AwsEventBusModule } from '@hexy/events-aws';

@Module({
  imports: [
    AwsEventBusModule.register({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
      },
      snsTopicArn: 'arn:aws:sns:us-east-1:123456789012:my-topic',
      sqsQueueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789012/my-queue',
      visibilityTimeout: 30,
      maxNumberOfMessages: 10
    })
  ]
})
export class AppModule {}
```

### Event Handlers

Event handlers work the same way regardless of the bus implementation:

```typescript
import { EventHandler, DomainEventHandler } from '@hexy/events';
import { UserCreatedEvent } from '../../domain/events/UserCreatedEvent';
import { EmailService } from '../services/EmailService';

@EventHandler()
export class UserCreatedEmailSender implements DomainEventHandler<UserCreatedEvent> {
  constructor(private readonly emailService: EmailService) {}

  eventType(): string {
    return UserCreatedEvent.name;
  }

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail({
      to: event.email,
      name: event.name,
      userId: event.userId
    });
    
    console.log(`Welcome email sent to ${event.email}`);
  }
}
```

## Persistence Infrastructure

Hexy implements the repository pattern to provide a clean interface between domain entities and data storage.

### Repository Pattern Implementation

```typescript
import { Repository } from '@hexy/core';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { UserMapper } from '../mappers/UserMapper';
import { DatabaseService } from '../services/DatabaseService';

@Repository()
export class PostgresUserRepository implements UserRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly mapper: UserMapper
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id.value]
    );
    
    if (!userData) {
      return null;
    }
    
    return this.mapper.toDomain(userData);
  }

  async save(user: User): Promise<void> {
    const userData = this.mapper.toPersistence(user);
    
    await this.db.query(
      `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = $2,
         email = $3,
         password_hash = $4,
         updated_at = $6`,
      [
        userData.id,
        userData.name,
        userData.email,
        userData.passwordHash,
        userData.createdAt,
        userData.updatedAt
      ]
    );
  }

  async delete(id: UserId): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id.value]);
  }
}
```

### Data Mappers

Data mappers transform between domain entities and persistence models:

```typescript
import { Mapper } from '@hexy/core';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { PasswordHash } from '../../domain/value-objects/PasswordHash';
import { UserDTO } from '../dto/UserDTO';

@Mapper()
export class UserMapper {
  toDomain(raw: UserDTO): User {
    return User.create({
      id: new UserId(raw.id),
      name: raw.name,
      email: new Email(raw.email),
      passwordHash: new PasswordHash(raw.password_hash),
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at)
    });
  }

  toPersistence(user: User): UserDTO {
    const { id, name, email, passwordHash, createdAt, updatedAt } = user.properties;
    
    return {
      id: id.value,
      name,
      email: email.value,
      password_hash: passwordHash.value,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString()
    };
  }
}
```

### Connection Management

Configure your database connection:

```typescript
import { Module } from '@hexy/core';
import { PostgresModule } from '@hexy/postgres';

@Module({
  imports: [
    PostgresModule.register({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'hexy_app',
      ssl: process.env.DB_SSL === 'true',
      poolSize: 10,
      idleTimeoutMillis: 30000
    })
  ]
})
export class DatabaseModule {}
```

### In-Memory Repository for Testing

```typescript
import { Repository } from '@hexy/core';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { UserRepository } from '../../domain/repositories/UserRepository';

@Repository()
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: UserId): Promise<User | null> {
    const user = this.users.get(id.value);
    return user ? user.clone() : null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id.value, user.clone());
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id.value);
  }

  // Helper method for testing
  clear(): void {
    this.users.clear();
  }
}
```

## Telemetry and Observability

Hexy integrates with OpenTelemetry to provide comprehensive monitoring, tracing, and logging.

### Setup and Configuration

```typescript
import { Module } from '@hexy/core';
import { TelemetryModule } from '@hexy/telemetry';

@Module({
  imports: [
    TelemetryModule.register({
      serviceName: 'hexy-example-service',
      serviceVersion: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      tracing: {
        enabled: true,
        exporter: {
          type: 'jaeger',
          endpoint: 'http://localhost:14268/api/traces'
        },
        samplingRatio: 1.0 // Sample all requests in development
      },
      metrics: {
        enabled: true,
        exporter: {
          type: 'prometheus',
          endpoint: '/metrics',
          port: 9464
        },
        hostMetrics: true,
        httpMetrics: true
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        correlation: true, // Adds trace IDs to logs
        prettyPrint: process.env.NODE_ENV !== 'production'
      }
    })
  ]
})
export class AppTelemetryModule {}
```

### Tracing Manually in Code

```typescript
import { Tracer, SpanStatusCode } from '@hexy/telemetry';
import { Injectable } from '@hexy/core';

@Injectable()
export class PaymentService {
  constructor(private readonly tracer: Tracer) {}

  async processPayment(userId: string, amount: number): Promise<boolean> {
    // Create a new span
    const span = this.tracer.startSpan('processPayment');
    
    // Add attributes for better context
    span.setAttributes({
      'user.id': userId,
      'payment.amount': amount,
      'payment.currency': 'USD'
    });
    
    try {
      // Your payment processing logic
      const result = await this.paymentGateway.charge(userId, amount);
      
      // Record successful outcome
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      
      return result.success;
    } catch (error) {
      // Record error
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      span.recordException(error);
      span.end();
      
      throw error;
    }
  }
}
```

### Automatic Tracing for HTTP and Database Operations

The telemetry module automatically traces HTTP requests and database operations without additional code:

```typescript
import { Controller, Get, Param } from '@hexy/http';
import { UserService } from '../../application/services/UserService';

// HTTP requests automatically create spans
@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    // userService methods will be part of the
    // HTTP request's trace automatically
    const user = await this.userService.findById(id);
    return { user };
  }
}
```

### Custom Metrics

```typescript
import { Metrics, Injectable } from '@hexy/telemetry';

@Injectable()
export class OrderService {
  constructor(private readonly metrics: Metrics) {
    // Initialize counters, gauges, and histograms
    this.orderCounter = this.metrics.createCounter({
      name: 'orders_created_total',
      description: 'Total number of orders created',
      labelNames: ['status', 'paymentMethod']
    });
    
    this.orderValueHistogram = this.metrics.createHistogram({
      name: 'order_value_usd',
      description: 'Order value distribution in USD',
      buckets: [10, 50, 100, 500, 1000, 5000]
    });
  }

  

