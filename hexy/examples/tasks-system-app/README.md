# Hexy - Task Management App Example

This application demonstrates a complete implementation of a Task Management system following:

- **Hexagonal Architecture** (Ports & Adapters)
- **Domain-Driven Design (DDD)** principles
- **SOLID** principles
- **Clean Architecture** practices

## Project Structure

The project is organized in clear layers following hexagonal architecture:

```
tasks-system-app/
│
├── domain/                     # Domain layer (core business logic)
│   └── task/
│       ├── aggregate/          # Aggregates, entities and value objects
│       │   ├── task.ts
│       │   └── task-id.ts
│       ├── service/            # Domain services
│       │   └── task-domain-service.ts
│       └── task-domain-module.ts   # Domain module configuration
│
├── application/                # Application layer (use cases)
│   └── task/
│       ├── dto/                # Data Transfer Objects
│       │   ├── create-task.dto.ts
│       │   └── update-task.dto.ts
│       ├── task-application-service.ts  # Application service
│       └── task-application-module.ts   # Application module configuration
│
├── infrastructure/             # Infrastructure layer (adapters)
│   └── task/
│       ├── repository/         # Repository implementations
│       │   └── in-memory-task-repository.ts
│       ├── controllers/        # HTTP controllers (Express)
│       │   └── task-controller.ts
│       └── task-infrastructure-module.ts  # Infrastructure module
│
├── server.ts                   # Express server entry point
├── server-with-module.ts       # Express server using module approach
└── main-module.ts               # Main module
```

## Architectural Principles

### Hexagonal Architecture

The hexagonal architecture clearly separates:

1. **Domain Layer**: The core business logic, independent of frameworks
2. **Application Layer**: Use case orchestration and business flows
3. **Infrastructure Layer**: Technical implementations like databases, APIs, and UI

### Dependency Flow

Dependencies always point toward the center:

```
Infrastructure → Application → Domain
```

This is achieved through:
- Interfaces in the domain layer (ports) implemented in the infrastructure layer (adapters)
- Dependency injection using Hexy's DI container to provide specific implementations

## Key Features

### Domain Layer

- **Value Objects**: Immutable objects like `TaskId`, `TaskTitle`, and `TaskDescription`
- **Entities**: Objects with identity and behavior (`Task`)
- **Domain Services**: Business logic that doesn't belong to entities
- **Repository Interfaces**: Defined in the domain layer for persistence abstraction

### Application Layer

- **Application Services**: Orchestrate use cases using domain objects
- **Data Transfer Objects (DTOs)**: Define data exchange contracts
- **Use Cases**: Well-defined business operations

### Infrastructure Layer

- **Repository Implementations**: In-memory task repository
- **HTTP Controllers**: Express-based REST API controllers
- **Dependency Injection**: Configuration of all services and components

## REST API Integration

The example includes a fully functional REST API built with Express and Hexy's adapter:

### API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a task by ID
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Express Integration

The application demonstrates two approaches to Express integration:

1. **Direct API configuration** (server.ts):
```typescript
import { container } from 'hexy/domain'
import { ExpressAdapter } from 'hexy/infrastructure/http/express'

// Create Express adapter with Hexy's DI container
const expressAdapter = new ExpressAdapter(container, {
  port: 3000,
  enableCors: true,
  enableBodyParser: true
})

// Register controllers
expressAdapter.registerControllers([TaskController])

// Start the server
await expressAdapter.listen()
```

2. **Module-based approach** (server-with-module.ts):
```typescript
import { container } from 'hexy/domain'
import { ExpressModule } from 'hexy/infrastructure/http'

// Create Express module
const expressModule = new ExpressModule(container, {
  expressOptions: {
    port: 3000,
    enableCors: true
  },
  controllers: [TaskController]
})

// Initialize and start
expressModule.initialize()
await expressModule.listen()
```

### Controller Implementation

```typescript
@Controller('/api/tasks')
export class TaskController {
  constructor(
    @Inject() private taskService: TaskApplicationService
  ) {}

  @Get()
  async getAllTasks() {
    const tasks = await this.taskService.getAllTasks()
    return { tasks }
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    const task = await this.taskService.createTask(
      createTaskDto.title,
      createTaskDto.description
    )
    return { task }
  }

  @Get('/:id')
  async getTaskById(@Param('id') id: string) {
    // Implementation
  }

  // More endpoints...
}
```

## Running the Example

```bash
# Install dependencies
npm install

# Start the server
npm run start:server
```

## API Examples

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Hexy", "description": "Master the Hexy framework", "priority": 1}'
```

### Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

### Get a Specific Task

```bash
curl http://localhost:3000/api/tasks/123
```

### Update a Task

```bash
curl -X PUT http://localhost:3000/api/tasks/123 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Task", "completed": true}'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/api/tasks/123
```

## Potential Extensions

This example can be extended with:

1. Persistent repositories (MongoDB, PostgreSQL)
2. Authentication and authorization
3. Advanced validation
4. Reactive programming patterns
5. More sophisticated domain logic
6. Event-driven architecture
7. Comprehensive testing suite 