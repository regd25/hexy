# Dependency Injection System for Hexy

The dependency injection system in Hexy is designed to facilitate the implementation of hexagonal architecture and DDD (DomainModule-Driven Design).

## Key Features

- **DI Container**: Centralized dependency management
- **Modules**: Organization of components into cohesive modules
- **Layer Decorators**: Clear separation between DDD layers (DomainModule, ApplicationModule, Infrastructure)
- **Lifecycle Hooks**: `onInit` and `onDestroy` hooks for component lifecycle management
- **Typed Tokens**: Strong TypeScript typing for improved type safety
- **Type Inference**: Automatic injection based on parameter types
- **Component Scanning**: Automatic discovery of components with decorators

## Basic Usage

### Define an Injectable Service

```typescript
import { Injectable } from '@hexy/domain';

@Injectable()
export class UserService {
  getUsers() {
    return ['user1', 'user2'];
  }
}
```

### Dependency Injection

```typescript
import { Injectable, Inject } from '@hexy/domain';
import { UserService } from './user.service';

@Injectable()
export class UserController {
  constructor(
    // Automatic injection based on type
    @Inject() private userService: UserService
  ) {}

  getAllUsers() {
    return this.userService.getUsers();
  }
}
```

### Lifecycle Management

```typescript
import { Injectable, OnInit, OnDestroy } from '@hexy/domain';

@Injectable()
export class DatabaseService implements OnInit, OnDestroy {
  private connection: any;

  async onInit() {
    console.log('Initializing database connection...');
    this.connection = await createConnection();
  }

  async onDestroy() {
    console.log('Closing database connection...');
    await this.connection.close();
  }
}
```

## Layer Organization (Hexagonal Architecture)

### DomainModule Layer

```typescript
import { DomainService, DomainEntity, DomainValueObject } from '@hexy/domain';

@DomainValueObject()
export class Email {
  constructor(private readonly value: string) {
    // Validation
    if (!value.includes('@')) throw new Error('Invalid email');
  }
}

@DomainEntity()
export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email
  ) {}
}

@DomainService()
export class UserDomainService {
  validateUser(user: User): boolean {
    // Pure domain logic
    return !!user.id;
  }
}
```

### ApplicationModule Layer

```typescript
import { ApplicationService, Inject } from 'hexy';
import { UserDomainService, User, Email } from '../domain';

@ApplicationService()
export class UserApplicationService {
  constructor(
    @Inject() private domainService: UserDomainService
  ) {}

  createUser(id: string, email: string): User {
    const user = new User(id, new Email(email));
    if (!this.domainService.validateUser(user)) {
      throw new Error('Invalid user');
    }
    return user;
  }
}
```

### Infrastructure Layer

```typescript
import { InfrastructureService, InjectionToken } from '@hexy/domain';

// Define interfaces in the domain
export interface UserRepository {
  findById(id: string): Promise<User | null>;
}

// Define token for injection
export const USER_REPOSITORY = new InjectionToken<UserRepository>('UserRepository');

// Implementation in infrastructure
@InfrastructureRepository()
export class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    // Actual implementation
    return null;
  }
}

// Module configuration
@InfrastructureModule({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PostgresUserRepository
    }
  ],
  exports: [USER_REPOSITORY]
})
export class UserInfrastructureModule extends Module {}
```

## Module Organization

```typescript
import { 
  ModuleDecorator, 
  Module, 
  ApplicationModule, 
  DomainModule 
} from '@hexy/domain';

@DomainModule({
  providers: [UserDomainService],
  exports: [UserDomainService]
})
export class UserDomainModule extends Module {}

@ApplicationModule({
  imports: [new DomainModule()],
  providers: [UserApplicationService],
  exports: [UserApplicationService]
})
export class UserApplicationModule extends Module {}

@ModuleDecorator({
  imports: [new ApplicationModule(), new Infrastructure()],
  providers: []
})
export class MainModule extends Module {}
```

## Component Scanning

```typescript
import { ComponentScanner, container } from 'hexy';

// Create a scanner and register components automatically
const scanner = new ComponentScanner(container, {
  autoRegister: true
});

// Scan components from a list of classes
const providers = scanner.scanComponents([
  UserDomainService,
  UserApplicationService,
  PostgresUserRepository
]);
```

This dependency injection system is designed to help you implement a clean hexagonal architecture with DDD, maintaining a clear separation between domain, application, and infrastructure layers. 