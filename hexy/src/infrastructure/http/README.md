# HTTP Adapters for Hexy

This module provides HTTP adapters for the Hexy framework, allowing you to expose your application through REST APIs that integrate seamlessly with Hexy's dependency injection system.

## Express Adapter

The Express adapter provides a clean integration between Hexy's dependency injection system and Express.js, making it easy to create well-structured REST APIs that follow hexagonal architecture principles.

### Key Features

- **Declarative Controllers**: Use decorators to define routes and controllers
- **Parameter Extraction**: Automatic extraction of request data with typed decorators
- **DI Integration**: Controllers and their dependencies are resolved via Hexy's DI container
- **Middleware Support**: Global and route-specific middleware
- **Type Safety**: Full TypeScript support for request parameters and responses

## Installation

The HTTP adapters are included in the Hexy framework. To use Express adapter, make sure you have Express installed:

```bash
npm install express
```

## Usage Guide

### Creating Controllers

#### 1. Define a Controller

Controllers act as adapters in the hexagonal architecture, connecting your application layer to the HTTP interface:

```typescript
import { Inject } from 'hexy'
import { Controller, Get, Post, Put, Delete, Body, Param } from 'hexy/infrastructure/http/express'
import { UserService } from '../../application/user.service'
import { CreateUserDto } from '../../application/dto/create-user.dto'

@Controller('/api/users')
export class UserController {
  constructor(
    @Inject() private userService: UserService
  ) {}

  @Get()
  async getAllUsers() {
    const users = await this.userService.findAll()
    return { users }
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findById(id)
    if (!user) {
      return { error: 'User not found' }
    }
    return { user }
  }

  @Post()
  async createUser(@Body() userData: CreateUserDto) {
    const user = await this.userService.create(userData)
    return { user }
  }

  @Put('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: any
  ) {
    const updated = await this.userService.update(id, userData)
    return { success: updated }
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    await this.userService.delete(id)
    return { success: true }
  }
}
```

#### 2. Register the Controller in a Module

```typescript
import { InfrastructureModule, Module } from 'hexy'
import { UserController } from './controllers/user.controller'

@InfrastructureModule({
  providers: [
    {
      provide: UserController,
      useClass: UserController
    }
  ],
  exports: []
})
export class ApiModule extends Module {
  // ...
}
```

### Server Setup

#### Method 1: Direct Express Integration

This approach gives you direct access to the Express adapter:

```typescript
import { container } from 'hexy'
import { ExpressAdapter } from 'hexy/infrastructure/http/express'
import { AppModule } from './app.module'
import { UserController } from './infrastructure/controllers/user.controller'

async function bootstrap() {
  // Initialize the application module
  const appModule = new AppModule()
  
  // Register all providers
  const providers = appModule.getAllProviders()
  container.registerMany(providers)
  
  // Create Express adapter
  const expressAdapter = new ExpressAdapter(container, {
    port: 3000,
    enableCors: true,
    enableBodyParser: true,
    globalMiddleware: [
      // Add your global middleware here
      (req, res, next) => {
        console.log(`Request: ${req.method} ${req.path}`)
        next()
      }
    ]
  })
  
  // Register controllers
  expressAdapter.registerControllers([
    UserController
  ])
  
  // Start the server
  await expressAdapter.listen()
  console.log('API is running on http://localhost:3000')
}

bootstrap()
```

#### Method 2: Using the Express Module

This approach encapsulates Express setup within a module:

```typescript
import { container } from 'hexy'
import { ExpressModule } from 'hexy/infrastructure/http'
import { AppModule } from './app.module'
import { UserController } from './infrastructure/controllers/user.controller'

async function bootstrap() {
  // Initialize the application module
  const appModule = new AppModule()
  
  // Register all providers
  const providers = appModule.getAllProviders()
  container.registerMany(providers)
  
  // Create and initialize Express module
  const expressModule = new ExpressModule(container, {
    expressOptions: {
      port: 3000,
      enableCors: true,
      enableBodyParser: true
    },
    controllers: [UserController]
  })
  
  // Initialize Express
  expressModule.initialize()
  
  // Start the server
  await expressModule.listen()
  console.log('API is running on http://localhost:3000')
}

bootstrap()
```

### Advanced Usage

#### Custom Middleware

You can add custom middleware to your Express application:

```typescript
const expressAdapter = new ExpressAdapter(container, {
  globalMiddleware: [
    // Logging middleware
    (req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
      next()
    },
    
    // Error handling middleware
    (err, req, res, next) => {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  ]
})
```

#### Access Express App Directly

You can access the underlying Express app for additional configuration:

```typescript
const expressAdapter = new ExpressAdapter(container)
const app = expressAdapter.getApp()

// Add custom Express configuration
app.set('view engine', 'ejs')
app.use('/static', express.static('public'))
```

## Available Decorators

### Controller Decorators

- `@Controller(path?: string)` - Marks a class as a controller with an optional base path

### Route Decorators

- `@Get(path?: string)` - Handles GET requests
- `@Post(path?: string)` - Handles POST requests
- `@Put(path?: string)` - Handles PUT requests
- `@Delete(path?: string)` - Handles DELETE requests
- `@Patch(path?: string)` - Handles PATCH requests

### Parameter Decorators

- `@Body(paramName?: string)` - Extracts request body or a specific property
- `@Query(paramName?: string)` - Extracts query parameters
- `@Param(paramName?: string)` - Extracts route parameters
- `@Req()` - Injects the Express Request object
- `@Res()` - Injects the Express Response object
- `@Next()` - Injects the Express NextFunction

## Integration with Hexagonal Architecture

The HTTP adapter serves as a primary adapter in hexagonal architecture:

```
                   ┌────────────────────┐
                   │     Express        │
                   │     Adapter        │
                   └──────────┬─────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────┐
│                HTTP Controllers                      │
│  @Controller, @Get, @Post, @Put, @Delete, @Patch    │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              Application Services                    │
│             (Use Case Orchestration)                 │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                   Domain Layer                       │
│        (Entities, Value Objects, Domain Logic)       │
└─────────────────────────────────────────────────────┘
```

This architecture ensures:

1. The domain remains isolated from HTTP concerns
2. Application services focus on use case orchestration
3. Controllers handle HTTP-specific logic and data transformation
4. Clear separation of responsibilities between layers 