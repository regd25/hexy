# Hexy Framework

![Hexy Logo](https://via.placeholder.com/150x50?text=Hexy)

## Introducción a Hexy y su arquitectura

Hexy es un framework basado en los principios de Domain-Driven Design (DDD) y Arquitectura Hexagonal (también conocida como Ports and Adapters) diseñado para aplicaciones Node.js. El framework facilita la implementación de aplicaciones empresariales complejas manteniendo la separación de responsabilidades y un enfoque centrado en el dominio.

La **Arquitectura Hexagonal** propone un diseño donde el núcleo de la aplicación (dominio) es independiente de las tecnologías externas, permitiendo que la lógica de negocio sea el centro del sistema y los adaptadores externos se comuniquen con ella a través de puertos bien definidos.

Hexy implementa esta arquitectura mediante tres capas principales:

- **Capa de Dominio**: Contiene la lógica de negocio y reglas del dominio
- **Capa de Aplicación**: Orquesta los casos de uso coordinando el dominio
- **Capa de Infraestructura**: Proporciona implementaciones concretas para comunicarse con servicios externos

### Beneficios principales:

- **Testabilidad**: Facilita las pruebas unitarias e integración gracias a la separación de capas
- **Mantenibilidad**: Estructura clara que soporta cambios y evolución del software
- **Modularidad**: Componentes desacoplados que se pueden reemplazar con mínimo impacto
- **Independencia tecnológica**: El dominio no depende de frameworks o bases de datos específicas

## Estructura del framework

Hexy organiza su código siguiendo una estructura que refleja las capas de la Arquitectura Hexagonal:

```
src/
├── domain/
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── services/
│   └── specifications/
├── application/
│   ├── services/
│   ├── use-cases/
│   ├── commands/
│   └── queries/
├── infrastructure/
│   ├── http/
│   ├── persistence/
│   ├── event-bus/
│   └── telemetry/
└── shared/
    ├── di/
    └── utils/
```

### Organización de carpetas:

- **domain**: Contiene los modelos de dominio, incluyendo agregados, entidades, objetos de valor, eventos y servicios de dominio.
- **application**: Contiene los servicios de aplicación y casos de uso que coordinan el flujo entre la infraestructura y el dominio.
- **infrastructure**: Implementaciones concretas de los puertos definidos en el dominio, como adaptadores HTTP, persistencia o mensajería.
- **shared**: Componentes compartidos como el sistema de inyección de dependencias, utilidades y código común.

## Sistema de Inyección de Dependencias

Hexy implementa un sistema de inyección de dependencias potente y tipado, facilitando la gestión de dependencias y el desacoplamiento entre componentes.

### Contenedor y Módulos

El sistema se basa en un contenedor centralizado y un sistema de módulos para organizar servicios:

```typescript
// Definición de un módulo
import { Module } from '@hexy/core';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';

@Module({
  providers: [
    UserRepository,
    CreateUserUseCase
  ],
  exports: [CreateUserUseCase]
})
export class UserModule {}
```

### Decoradores específicos por capa

Hexy proporciona decoradores para cada capa, mejorando la legibilidad y documentación del código:

```typescript
import { DomainService, ApplicationService, InfrastructureService } from '@hexy/core';

@DomainService()
export class ProductDomainService {
  // Lógica del dominio
}

@ApplicationService()
export class OrderApplicationService {
  // Orquestación de casos de uso
}

@InfrastructureService()
export class PostgresUserRepository {
  // Implementación de persistencia
}
```

### Ciclo de vida de componentes

El sistema permite gestionar el ciclo de vida de los servicios con hooks para inicialización y limpieza:

```typescript
import { Injectable, OnInit, OnDestroy } from '@hexy/core';

@Injectable()
export class DatabaseConnection implements OnInit, OnDestroy {
  async onInit(): Promise<void> {
    // Inicializar conexión a la base de datos
    console.log('Conexión establecida');
  }

  async onDestroy(): Promise<void> {
    // Cerrar conexión
    console.log('Conexión cerrada');
  }
}
```

### Resolución tipada de dependencias

```typescript
import { Inject, Injectable } from '@hexy/core';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository
  ) {}
  
  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
```

## Módulos y Capas

Hexy utiliza un sistema de módulos para organizar la aplicación en unidades funcionales cohesivas que encapsulan características relacionadas.

### Módulo Principal

El módulo principal de la aplicación típicamente integra los submódulos del sistema:

```typescript
import { RootModule } from '@hexy/core';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@RootModule({
  imports: [
    UserModule,
    OrderModule,
    ProductModule,
    InfrastructureModule
  ]
})
export class AppModule {}
```

### Comunicación entre capas

Cada capa tiene responsabilidades específicas y patrones de comunicación:

1. **Dominio → Aplicación → Infraestructura**: El flujo principal va desde el dominio hacia afuera
2. **Infraestructura → Aplicación → Dominio**: Las solicitudes externas entran por infraestructura y llegan al dominio

### Ejemplo de interacción entre capas:

```typescript
// Capa de Dominio - Entidad
@Entity()
export class User {
  constructor(
    private readonly id: UserId,
    private name: UserName,
    private email: UserEmail
  ) {}
  
  updateName(name: UserName): void {
    this.name = name;
    // Emisión de eventos de dominio
    this.record(new UserNameUpdatedEvent(this.id, this.name));
  }
}

// Capa de Aplicación - Caso de uso
@ApplicationService()
export class UpdateUserNameUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus
  ) {}
  
  async execute(command: UpdateUserNameCommand): Promise<void> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }
    
    user.updateName(new UserName(command.name));
    await this.userRepository.save(user);
    await this.eventBus.publish(user.releaseEvents());
  }
}

// Capa de Infraestructura - Controlador HTTP
@Controller('/users')
export class UserController {
  constructor(
    private readonly updateUserNameUseCase: UpdateUserNameUseCase
  ) {}
  
  @Put('/:id/name')
  async updateName(req: Request, res: Response): Promise<void> {
    try {
      await this.updateUserNameUseCase.execute({
        userId: req.params.id,
        name: req.body.name
      });
      res.status(200).send();
    } catch (error) {
      // Manejo de errores
    }
  }
}
```

## Adaptadores HTTP

Hexy proporciona una capa de abstracción para frameworks HTTP como Express, permitiendo definir controladores y rutas de manera declarativa.

### Controladores y Rutas

```typescript
import { Controller, Get, Post, Body, Param } from '@hexy';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { CreateProductDto } from './dtos/create-product.dto';

@Controller('/products')
export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase
  ) {}
  
  @Get('/')
  async getAllProducts(req: Request, res: Response) {
    // Implementación
  }
  
  @Get('/:id')
  async getProduct(@Param('id') id: string, res: Response) {
    // Implementación
  }
  
  @Post('/')
  async createProduct(@Body() productDto: CreateProductDto, res: Response) {
    try {
      const result = await this.createProductUseCase.execute(productDto);
      return res.status(201).json(result);
    } catch (error) {
      // Manejo de errores
    }
  }
}
```

### Middlewares

Hexy soporta middlewares para operaciones transversales:

```typescript
import { Controller, UseMiddleware } from '@hexy';
import { AuthMiddleware, LoggerMiddleware } from '../middlewares';

@Controller('/secure')
@UseMiddleware(AuthMiddleware)
export class SecureController {
  @Get('/')
  @UseMiddleware(LoggerMiddleware)
  async getSecureData(req: Request, res: Response) {
    // Implementación protegida
  }
}
```

### Integración con Express

```typescript
import { ExpressAdapter } from '@hexy';
import { AppModule } from './app.module';
import express from 'express';

async function bootstrap() {
  const app = express();
  app.use(express.json());
  
  const container = await Hexy.createApplication(AppModule);
  const httpAdapter = container.resolve(ExpressAdapter);
  
  httpAdapter.init(app);
  
  app.listen(3000, () => {
    console.log('Servidor iniciado en puerto 3000');
  });
}

bootstrap();
```

## Patrones DDD implementados

Hexy implementa varios patrones de Domain-Driven Design para facilitar el desarrollo de aplicaciones complejas.

### Agregados y Entidades

```typescript
import { AggregateRoot, Entity, Identifier } from '@hexy/domain';

@Entity()
export class OrderLine {
  constructor(
    private readonly id: OrderLineId,
    private productId: ProductId,
    private quantity: number,
    private price: Money
  ) {}
  
  calculateTotal(): Money {
    return this.price.multiply(this.quantity);
  }
}

@AggregateRoot()
export class Order {
  private lines: OrderLine[] = [];
  
  constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private status: OrderStatus
  ) {}
  
  addLine(line: OrderLine): void {
    this.lines.push(line);
    this.record(new OrderLineAddedEvent(this.id, line));
  }
  
  // Métodos para gestionar el agregado
}
```

### Objetos de Valor

```typescript
import { ValueObject } from '@hexy/domain';

export class Money extends ValueObject<{amount: number; currency: string}> {
  private constructor(props: {amount: number; currency: string}) {
    super(props);
  }
  
  static create(amount: number, currency: string): Money {
    // Validaciones
    return new Money({amount, currency});
  }
  
  add(money: Money): Money {
    if (this.props.currency !== money.props.currency) {
      throw new Error('No se pueden sumar monedas de diferente divisa');
    }
    
    return Money.create(
      this.props.amount + money.props.amount,
      this.props.currency
    );
  }
  
  multiply(factor: number): Money {
    return Money.create(
      this.props.amount * factor,
      this.props.currency
    );
  }
}
```

### Eventos de Dominio

```typescript
import { DomainEvent } from '@hexy/domain';

export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId
  ) {
    super({
      aggregateId: orderId.value,
      eventName: 'order.created',
      occurredOn: new Date()
    });
  }
}
```

### Servicios de Dominio

```typescript
import { DomainService } from '@hexy/domain';

@DomainService()
export class DiscountService {
  calculateDiscount(order: Order, discountPolicy: DiscountPolicy): Money {
    // Lógica compleja que involucra múltiples entidades
    return Money.create(/* cálculo */);
  }
}
```

### Especificaciones y Criterios

```typescript
import { Specification } from '@hexy/domain';

export class ActiveCustomerSpecification implements Specification<Customer> {
  isSatisfiedBy(customer: Customer): boolean {
    return customer.status === CustomerStatus.ACTIVE;
  }
}

// Uso con criterios para consultas
const criteria = {
  filters: [
    {field: 'status', operator: 'equals', value: CustomerStatus.ACTIVE},
    {field: 'createdAt', operator: 'greaterThan', value: someDate}
  ],
  order: {field: 'createdAt', direction: 'desc'},
  pagination: {page: 1, limit: 10}
};

const customers = await customerRepository.findByCriteria(criteria);
```

---

## Instalación y configuración

```bash
# Utilizando npm
npm install @hexy/core @hexy/domain @hexy

# Utilizando yarn
yarn add @hexy/core @hexy/domain @hexy
```

Para más información y documentación detallada, consulta los siguientes recursos:

- [Documentación de la capa de dominio](/docs/domain-layer.md)
- [Documentación de la capa de aplicación](/docs/application-layer.md)
- [Documentación de infraestructura](/docs/infrastructure-layer.md)
- [Guías técnicas](/docs/technical-guides.md)
- [Ejemplos prácticos](/examples)

# Hexy

A lightweight, flexible framework for implementing Domain-Driven Design (DDD) and Hexagonal Architecture in JavaScript/TypeScript applications.

## 1. Introduction to Hexy

Hexy provides a structured approach to building scalable, maintainable applications using Domain-Driven Design (DDD) and Hexagonal Architecture (also known as Ports and Adapters) principles.

### Domain-Driven Design (DDD)

DDD is a software development approach that focuses on:

- Creating a **rich domain model** that reflects business concepts and rules
- Using a **ubiquitous language** shared between developers and domain experts
- Organizing code around business domains rather than technical concerns
- Defining clear **bounded contexts** to separate different business domains

Hexy offers tools and patterns to implement DDD concepts like:

- **Aggregates**: Clusters of domain objects treated as a single unit
- **Entities**: Objects with an identity and lifecycle
- **Value Objects**: Immutable objects defined by their attributes
- **Domain Events**: Notifications of significant occurrences within the domain
- **Repositories**: Interfaces for accessing and persisting domain objects

### Hexagonal Architecture

Hexagonal Architecture (Ports and Adapters) is a design pattern that:

- Places the **domain model** at the center of the application
- Creates a clear separation between business logic and external concerns
- Defines explicit boundaries between application layers
- Uses **ports** (interfaces) to define how the domain can be interacted with
- Implements **adapters** that connect external systems to these ports

Hexy facilitates this by providing:

- A clear structure for organizing application, domain, and infrastructure layers
- Dependency injection to manage relationships between components
- Adapters for common infrastructure needs (HTTP, databases, event buses)
- Clean interfaces between layers to maintain architectural integrity

## 2. Key Benefits

Implementing your application with Hexy offers several advantages:

### 🧩 Modular Design
- **Plug-and-play components** allow easy replacement of infrastructure implementations
- **Clear boundaries** between modules enable focused development
- **Loose coupling** between components simplifies maintenance and extension

### 🧪 Enhanced Testability
- **Domain logic isolation** makes unit testing straightforward
- **Mock adapters** simplify testing without external dependencies
- **In-memory implementations** of repositories and event buses for fast tests

### 🛠️ Maintainability
- **Consistent patterns** across the codebase
- **Clear separation of concerns** makes code easier to understand
- **Well-defined interfaces** reduce unexpected side effects

### 🚀 Developer Experience
- **Decorators and utilities** reduce boilerplate code
- **Type-safe dependency injection** catches errors at compile time
- **Standardized structure** helps new developers understand the codebase quickly

### 🔄 Adaptability
- **Technology-agnostic core** allows infrastructure to evolve independently
- **Multiple adapter implementations** for different environments (development, testing, production)
- **Gradual adoption** possible in existing projects

## 3. Installation and Setup

### Prerequisites

- Node.js (v14 or later)
- TypeScript (v4.5 or later recommended)

### Installation

Install Hexy using npm:

```bash
npm install @hexy/core @hexy/di
npm install --save-dev @hexy/cli
```

Or with yarn:

```bash
yarn add @hexy/core @hexy/di
yarn add --dev @hexy/cli
```

### Basic Setup

1. Create a project structure (or use CLI to generate it):

```bash
npx @hexy/cli init my-hexy-project
```

2. Configure TypeScript (tsconfig.json):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "dist",
    "baseUrl": "src",
    "paths": {
      "@domain/*": ["domain/*"],
      "@application/*": ["application/*"],
      "@infrastructure/*": ["infrastructure/*"]
    }
  }
}
```

3. Create your first module:

```typescript
// src/app.module.ts
import { Module } from '@hexy/di';
import { OrderModule } from './order/order.module';

@Module({
  imports: [OrderModule]
})
export class AppModule {}
```

4. Bootstrap your application:

```typescript
// src/index.ts
import { Container } from '@hexy/di';
import { AppModule } from './app.module';

async function bootstrap() {
  const container = Container.create();
  await container.init(AppModule);
  
  console.log('Application started');
  
  // For HTTP applications, you might start your server here
  // const server = container.resolve(HttpServer);
  // await server.start();
}

bootstrap().catch(console.error);
```

### CLI Usage

Hexy includes a CLI for common tasks:

```bash
# Generate a new aggregate
npx @hexy/cli generate:aggregate Order --context=sales

# Generate a value object
npx @hexy/cli generate:value-object Price --context=sales

# Create a new use case
npx @hexy/cli generate:use-case CreateOrder --context=sales
```

For more detailed documentation on each component and advanced usage patterns, refer to the full documentation.

# Hexy Framework

Hexy es un framework moderno para Node.js/TypeScript que implementa los principios de Domain-Driven Design (DDD) y Arquitectura Hexagonal.

## Características principales

- **Arquitectura hexagonal**: Separa claramente las capas de dominio, aplicación e infraestructura.
- **Domain-Driven Design**: Facilita la implementación de agregados, entidades, objetos de valor y repositorios.
- **Inyección de dependencias**: Sistema avanzado de DI con soporte para arquitectura por capas.
- **Event-Driven**: Publicación y manejo de eventos de dominio para comunicación entre componentes.
- **Serverless**: Soporte para entornos serverless mediante adaptadores.
- **CLI integrada**: Herramientas de línea de comandos para acelerar el desarrollo.

## Instalación

```bash
npm install @hexy/core
```

## Uso básico

### Arquitectura Hexagonal con DI orientada a capas

Hexy proporciona decoradores específicos para cada capa de la arquitectura hexagonal:

```typescript
// Capa de dominio - Contiene la lógica de negocio
@DomainService()
class ProductDomainService {
  validatePrice(price: number): boolean {
    return price > 0;
  }
}

// Capa de infraestructura - Implementa interfaces del dominio
@RepositoryImplementation()
class MongoProductRepository implements ProductRepository {
  // Implementación de base de datos
}

// Capa de aplicación - Orquesta casos de uso
@ApplicationService()
class CreateProductUseCase {
  constructor(
    private productRepository: ProductRepository,
    private productDomainService: ProductDomainService
  ) {}
  
  async execute(data: ProductData): Promise<Product> {
    // Lógica de aplicación
  }
}
```

### Organización de módulos por capas

```typescript
// Módulos específicos por capas
@DomainModule({
  providers: [ProductDomainService]
})
class ProductDomainModule {}

@InfrastructureModule({
  providers: [
    MongoProductRepository,
    { provide: ProductRepository, useClass: MongoProductRepository }
  ],
  imports: [ProductDomainModule]
})
class ProductInfrastructureModule {}

@ApplicationModule({
  providers: [CreateProductUseCase],
  imports: [ProductDomainModule, ProductInfrastructureModule]
})
class ProductApplicationModule {}
```

### Validación de dependencias entre capas

Hexy puede validar automáticamente la correcta separación de capas:

```typescript
const app = new Application();
app.registerModules([
  ProductDomainModule,
  ProductInfrastructureModule,
  ProductApplicationModule
]);

// Validar dependencias entre capas
const validationResult = app.validateLayerDependencies();
if (!validationResult.valid) {
  console.error('Violaciones de arquitectura detectadas:', validationResult.violations);
}
```

## Estructura de directorios recomendada

```
/src
  /domain            # Capa de dominio (entidades, agregados, reglas de negocio)
    /aggregate
    /service
    /repository      # Interfaces de repositorio
  /application       # Capa de aplicación (casos de uso, servicios de aplicación)
    /use-case
    /service
  /infrastructure    # Capa de infraestructura (adaptadores, implementaciones)
    /persistence
    /api
    /messaging
  /shared            # Componentes compartidos
    /domain
    /utils
```

## Documentación

Para la documentación completa, visite [la documentación oficial](https://docs.hexy.io).

## Contribuir

Las contribuciones son bienvenidas. Por favor, lea las [directrices de contribución](CONTRIBUTING.md) antes de enviar un pull request.

## Licencia

[MIT](LICENSE) 