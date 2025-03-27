# Domain Layer Documentation

## Domain Events and Event Bus

Domain Events are a crucial part of Domain-Driven Design (DDD), allowing your system to communicate changes and react to them in a decoupled manner. Events represent something significant that has happened in the domain, typically as a result of a command or action.

### Creating Domain Events

In Hexy, domain events extend the base `Event` class and implement several key methods:

```typescript
import { Event, DataRecord, UuidValueObject } from '@hexy/domain';

@DomainEvent()
export class TaskCreatedEvent extends Event {
  constructor(
    aggregateId: string,
    private readonly title: string,
    private readonly description: string,
    occurredOn: Date = new Date()
  ) {
    super(
      new UuidValueObject(aggregateId),
      { value: 'task.created' },
      occurredOn
    );
  }

  // Convert the event to primitives for serialization
  toPrimitives(): DataRecord {
    return {
      id: this.aggregateId.toString(),
      title: this.title,
      description: this.description,
      occurredOn: this.occurredOn.toISOString()
    };
  }

  // Get the name of the event (used for routing)
  getEventName(): string {
    return 'TaskCreatedEvent';
  }

  // Recreate the event from primitives
  fromPrimitives(data: DataRecord): Event {
    return new TaskCreatedEvent(
      data.id as string,
      data.title as string,
      data.description as string,
      new Date(data.occurredOn as string)
    );
  }
}
```

### Publishing Events

Aggregates typically publish events when their state changes. The Hexy framework provides an `AggregateRoot` class that includes support for collecting and publishing domain events:

```typescript
import { AggregateRoot, UuidValueObject } from '@hexy/domain';
import { TaskCreatedEvent } from '../event/task-created-event';

export class Task extends AggregateRoot {
  // ...other properties and methods

  static create(id: string, title: string, description: string): Task {
    const task = new Task(
      new UuidValueObject(id),
      title,
      description
    );
    
    // Record a domain event
    task.record(new TaskCreatedEvent(
      id,
      title,
      description
    ));
    
    return task;
  }
}
```

### Event Bus Implementation

Hexy provides an abstract `EventBus` class that you can implement to suit your infrastructure needs. The event bus is responsible for publishing events and routing them to the appropriate handlers.

```typescript
import { Injectable, EventBus, Event, EventHandler } from '@hexy/domain';

@Injectable()
export class InMemoryEventBus extends EventBus {
  private handlers: Map<string, EventHandler<Event>[]> = new Map();

  // Publish events to registered handlers
  async publish(events: Event[]): Promise<void> {
    events.forEach(event => {
      const eventName = event.getEventName();
      const handlers = this.handlers.get(eventName) || [];
      
      handlers.forEach(async handler => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error handling event ${eventName}:`, error);
        }
      });
    });
  }

  // Register a new event handler
  addListener<T extends Event>(handler: EventHandler<T>): void {
    const eventName = this.getEventNameFromHandler(handler);
    
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    
    this.handlers.get(eventName)!.push(handler as EventHandler<Event>);
  }

  // Helper method to extract event name from handler
  private getEventNameFromHandler<T extends Event>(handler: EventHandler<T>): string {
    // Implementation would depend on your handler pattern
    // This is a simplified example
    return handler.constructor.name.replace('Handler', '');
  }
}
```

### Creating Event Handlers

Event handlers are responsible for reacting to domain events. They can update read models, trigger processes, or invoke external systems:

```typescript
import { Injectable } from '@hexy/domain';
import { TaskCreatedEvent } from '../event/task-created-event';

@Injectable()
export class TaskCreatedEventHandler {
  constructor(private readonly logger: Logger) {}

  async handle(event: TaskCreatedEvent): Promise<void> {
    this.logger.info(`Task created: ${event.toPrimitives().title}`);
    
    // Handle the event (e.g., update read models, trigger notifications)
    await this.updateReadModel(event);
    await this.sendNotification(event);
  }

  private async updateReadModel(event: TaskCreatedEvent): Promise<void> {
    // Implementation to update read models
  }

  private async sendNotification(event: TaskCreatedEvent): Promise<void> {
    // Implementation to send notifications
  }
}
```

### Registering Event Handlers

You can register event handlers with the event bus when your application starts:

```typescript
import { Injectable, OnModuleInit } from '@hexy/core';
import { EventBus } from '@hexy/domain';
import { TaskCreatedEventHandler } from './task-created-event-handler';

@Injectable()
export class EventHandlerRegistry implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBus,
    private readonly taskCreatedHandler: TaskCreatedEventHandler
  ) {}

  onModuleInit(): void {
    // Register event handlers
    this.eventBus.addListener<TaskCreatedEvent>(
      this.taskCreatedHandler.handle.bind(this.taskCreatedHandler)
    );
  }
}
```

## Domain Services

Domain Services encapsulate business logic that doesn't naturally fit within an entity or value object. They typically operate on multiple aggregates or contain complex domain rules.

### When to Use Domain Services

- When logic involves multiple aggregates
- When the operation doesn't conceptually belong to any single entity
- When the logic represents a significant domain process or transformation
- When the behavior is stateless

### Creating a Domain Service

In Hexy, domain services are marked with the `@DomainService()` decorator:

```typescript
import { DomainService } from '@hexy/domain';
import { Task } from '../aggregate/task';
import { User } from '../aggregate/user';
import { TaskPriority } from '../value-object/task-priority';

@DomainService()
export class TaskAssignmentService {
  // Assign a task to a user based on domain rules
  assignTask(task: Task, user: User): void {
    // Check if user has capacity
    if (!this.userHasCapacity(user)) {
      throw new Error('User has reached maximum task capacity');
    }
    
    // Check if user has required skills
    if (!this.userHasRequiredSkills(task, user)) {
      throw new Error('User does not have the required skills');
    }
    
    // Assign the task
    task.assignTo(user.id);
    
    // Adjust priority based on user's current workload
    const newPriority = this.calculatePriority(task, user);
    task.updatePriority(newPriority);
  }
  
  // Calculate task completion estimate based on complexity and user metrics
  calculateCompletionEstimate(task: Task, user: User): Date {
    const baseTime = task.getBaseCompletionTime();
    const userEfficiencyFactor = user.getEfficiencyFactor();
    const taskComplexity = task.getComplexity();
    
    // Domain formula for calculating completion time
    const completionTimeHours = baseTime * taskComplexity / userEfficiencyFactor;
    
    const estimatedCompletion = new Date();
    estimatedCompletion.setHours(estimatedCompletion.getHours() + completionTimeHours);
    
    return estimatedCompletion;
  }
  
  // Private methods representing domain rules
  private userHasCapacity(user: User): boolean {
    return user.getCurrentTaskCount() < user.getMaxTaskCapacity();
  }
  
  private userHasRequiredSkills(task: Task, user: User): boolean {
    const requiredSkills = task.getRequiredSkills();
    const userSkills = user.getSkills();
    
    return requiredSkills.every(skill => userSkills.includes(skill));
  }
  
  private calculatePriority(task: Task, user: User): TaskPriority {
    // Complex domain logic to calculate priority
    // based on task attributes and user's current workload
    if (user.getCurrentTaskCount() > 5 && task.isUrgent()) {
      return TaskPriority.HIGH;
    }
    
    return task.getPriority();
  }
}
```

### Best Practices for Domain Services

1. **Keep them stateless**: Domain Services should not maintain state between method calls
2. **Name them after domain processes**: Use verb-noun naming (e.g., `OrderProcessor`, `PaymentService`)
3. **Focus on domain logic**: Don't include infrastructure concerns like persistence
4. **Use domain language**: Methods and arguments should use domain terminology
5. **Apply SRP**: Each service should have a single responsibility within the domain

### Domain Service vs. Application Service

| Domain Service | Application Service |
|----------------|---------------------|
| Contains core business logic | Orchestrates use cases |
| Works with domain objects | Translates between DTOs and domain objects |
| No infrastructure dependencies | May have infrastructure dependencies |
| Called by application services | Called by controllers or external systems |
| Usually not exposed outside domain | Exposed as application API |

## Specifications and Criteria

Specifications and Criteria are patterns for querying and filtering domain objects based on specific conditions.

### Specification Pattern

The Specification Pattern encapsulates business rules that can be combined through boolean logic. Specifications can be used to check if an entity satisfies certain criteria.

```typescript
import { Specification, Entity } from '@hexy/domain';
import { Task } from '../aggregate/task';

// A specification that checks if a task is overdue
export class OverdueTaskSpecification extends Specification {
  isSatisfiedBy(entity: Entity): boolean {
    if (!(entity instanceof Task)) {
      return false;
    }
    
    const task = entity as Task;
    const now = new Date();
    return task.dueDate.toPrimitive() < now;
  }
  
  // Combine with another specification using AND
  and(specification: Specification): Specification {
    return new AndSpecification(this, specification);
  }
  
  // Combine with another specification using OR
  or(specification: Specification): Specification {
    return new OrSpecification(this, specification);
  }
  
  // Negate this specification
  not(): Specification {
    return new NotSpecification(this);
  }
  
  // Exclusive OR with another specification
  xor(specification: Specification): Specification {
    return new XorSpecification(this, specification);
  }
}

// A specification that checks if a task is high priority
export class HighPriorityTaskSpecification extends Specification {
  isSatisfiedBy(entity: Entity): boolean {
    if (!(entity instanceof Task)) {
      return false;
    }
    
    const task = entity as Task;
    return task.priority.getValue() === 'high';
  }
  
  // Implementation of boolean operations...
  and(specification: Specification): Specification {
    return new AndSpecification(this, specification);
  }
  
  or(specification: Specification): Specification {
    return new OrSpecification(this, specification);
  }
  
  not(): Specification {
    return new NotSpecification(this);
  }
  
  xor(specification: Specification): Specification {
    return new XorSpecification(this, specification);
  }
}
```

### Composite Specifications

To combine specifications, we implement composite specifications like `AndSpecification`, `OrSpecification`, etc.:

```typescript
import { Specification, Entity } from '@hexy/domain';

// AND composite specification
export class AndSpecification extends Specification {
  constructor(
    private readonly leftSpec: Specification,
    private readonly rightSpec: Specification
  ) {
    super();
  }
  
  isSatisfiedBy(entity: Entity): boolean {
    return this.leftSpec.isSatisfiedBy(entity) && this.rightSpec.isSatisfiedBy(entity);
  }
  
  // Implementation of boolean operations...
  and(specification: Specification): Specification {
    return new AndSpecification(this, specification);
  }
  
  or(specification: Specification): Specification {
    return new OrSpecification(this, specification);
  }
  
  not(): Specification {
    return new NotSpecification(this);
  }
  
  xor(specification: Specification): Specification {
    return new XorSpecification(this, specification);
  }
}

// NOT composite specification
export class NotSpecification extends Specification {
  constructor(private readonly spec: Specification) {
    super();
  }
  
  isSatisfiedBy(entity: Entity): boolean {
    return !this.spec.isSatisfiedBy(entity);
  }
  
  // Implementation of boolean operations...
}
```

### Using Specifications

Specifications can be used to filter entities or check conditions:

```typescript
// Filter tasks using specifications
const overdue = new OverdueTaskSpecification();
const highPriority = new HighPriorityTaskSpecification();

// Create a combined specification for high-priority overdue tasks
const urgentTasks = overdue.and(highPriority);

// Use the specification to filter a collection
const tasksRequiringAttention = allTasks.filter(task => 
  urgentTasks.isSatisfiedBy(task)
);
```

### Criteria for Repository Queries

The Criteria pattern complements Specifications by providing a structured way to express query parameters for repositories. It helps build type-safe, maintainable query objects:

```typescript
import { 
  Criteria, 
  Filters, 
  Filter, 
  FilterField, 
  FilterOperator, 
  FilterValue,
  Order,
  OrderBy,
  OrderType,
  OrderTypes
} from '@hexy/domain';

// Create a filter for tasks with 'high' priority
const priorityFilter = new Filter(
  new FilterField('priority'),
  FilterOperator.equal(),
  new FilterValue('high')
);

// Create a filter for tasks in 'pending' status
const statusFilter = new Filter(
  new FilterField('status'),
  FilterOperator.equal(),
  new FilterValue('pending')
);

// Combine filters
const filters = new Filters([priorityFilter, statusFilter]);

// Add ordering (sort by due date ascending)
const order = new Order(
  new OrderBy('dueDate'),
  new OrderType(OrderTypes.ASC)
);

// Create the criteria object
const criteria = new Criteria(filters, order);

// Use in a repository
const tasks = await taskRepository.matching(criteria);
```

### Creating Criteria from Primitives

For convenience, Hexy allows creating criteria from primitive values:

```typescript
// Create criteria from primitives
const criteria = Criteria.fromPrimitives(
  [
    { field: 'priority', operator: '=', value: 'high' },
    { field: 'status', operator: '=', value: 'pending' }
  ],
  'dueDate',
  'asc'
);
```

### Custom Filter Operators

Hexy provides common filter operators, but you can create custom ones for specific needs:

```typescript
// Available operators
const equalsOperator = FilterOperator.equal();           // =
const notEqualsOperator = FilterOperator

# Domain Layer

The domain layer is the heart of your application in DDD (Domain-Driven Design). This document explains the key concepts and patterns used within the domain layer of the Hexy framework.

## Table of Contents
1. [Aggregates and Entities](#aggregates-and-entities)
2. [Value Objects](#value-objects)
3. [Domain Events and Event Bus](#domain-events-and-event-bus)
4. [Domain Services](#domain-services)
5. [Specifications and Criteria](#specifications-and-criteria)

## Aggregates and Entities

### Concepts

**Entities** are domain objects that have a unique identity and are mutable.

**Aggregates** are clusters of domain objects (entities and value objects) that are treated as a single unit. Each aggregate has a root entity, known as the "Aggregate Root," which serves as the entry point to the aggregate.

### File Structure

A typical file structure for aggregates and entities in Hexy looks like:

```
src/domain/
├── user/
│   ├── User.ts                     # Aggregate Root
│   ├── UserEmail.ts                # Value Object
│   ├── UserPassword.ts             # Value Object
│   ├── UserId.ts                   # Value Object (Identity)
│   ├── UserRepository.ts           # Repository Interface
│   └── events/
│       └── UserCreatedEvent.ts     # Domain Event
├── order/
│   ├── Order.ts                    # Aggregate Root
│   ├── OrderId.ts                  # Value Object (Identity)
│   ├── OrderItem.ts                # Entity inside the aggregate
│   ├── OrderStatus.ts              # Value Object (Enumeration)
│   ├── OrderRepository.ts          # Repository Interface
│   └── events/
│       ├── OrderCreatedEvent.ts    # Domain Event
│       └── OrderStatusChangedEvent.ts  # Domain Event
```

### Code Examples

#### Entity Base Class

```typescript
// domain/shared/Entity.ts
import { UniqueEntityID } from './UniqueEntityID';

export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID;
  protected props: T;

  constructor(props: T, id?: UniqueEntityID) {
    this._id = id || new UniqueEntityID();
    this.props = props;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id.equals(entity._id);
  }

  get id(): UniqueEntityID {
    return this._id;
  }
}
```

#### Aggregate Root Example

```typescript
// domain/user/User.ts
import { AggregateRoot } from '../shared/AggregateRoot';
import { UserId } from './UserId';
import { UserEmail } from './UserEmail';
import { UserPassword } from './UserPassword';
import { UserCreatedEvent } from './events/UserCreatedEvent';

interface UserProps {
  email: UserEmail;
  password: UserPassword;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UserId) {
    super(props, id);
  }

  get userId(): UserId {
    return UserId.create(this.id.toString());
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
  
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }
  
  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public static create(
    props: Omit<UserProps, 'createdAt' | 'updatedAt' | 'isActive'>,
    id?: UserId
  ): User {
    const defaultProps: UserProps = {
      ...props,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = new User(defaultProps, id);
    
    // Add domain event
    user.addDomainEvent(new UserCreatedEvent(user));
    
    return user;
  }
}
```

#### Aggregate Root Base Class

```typescript
// domain/shared/AggregateRoot.ts
import { Entity } from './Entity';
import { DomainEvent } from './DomainEvent';
import { UniqueEntityID } from './UniqueEntityID';
import { DomainEvents } from './DomainEvents';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
```

## Value Objects

### Concepts

Value Objects are immutable objects that describe characteristics of a domain. They don't have an identity and are defined by their attributes.

### Types of Value Objects

1. **Simple Value Objects** - Encapsulate simple values like email, name
2. **Complex Value Objects** - Composed of multiple attributes (e.g., Address)
3. **Collection Value Objects** - Represent collections (e.g., Tags)
4. **Enumeration Value Objects** - Represent a fixed set of values (e.g., Status)
5. **Identity Value Objects** - Represent identifiers (e.g., OrderId)

### Code Examples

#### Value Object Base Class

```typescript
// domain/shared/ValueObject.ts
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    
    if (vo.props === undefined) {
      return false;
    }
    
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
```

#### Simple Value Object Example (Email)

```typescript
// domain/user/UserEmail.ts
import { ValueObject } from '../shared/ValueObject';

interface UserEmailProps {
  value: string;
}

export class UserEmail extends ValueObject<UserEmailProps> {
  private constructor(props: UserEmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  private static isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  public static create(email: string): UserEmail {
    if (!this.isValidEmail(email)) {
      throw new Error('Email address is not valid');
    }
    
    return new UserEmail({ value: email.toLowerCase() });
  }
}
```

#### Complex Value Object Example (Address)

```typescript
// domain/shared/Address.ts
import { ValueObject } from './ValueObject';

interface AddressProps {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class Address extends ValueObject<AddressProps> {
  private constructor(props: AddressProps) {
    super(props);
  }

  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }

  get country(): string {
    return this.props.country;
  }

  public static create(props: AddressProps): Address {
    if (!props.street || !props.city || !props.state || !props.postalCode || !props.country) {
      throw new Error('Address must include street, city, state, postal code, and country');
    }
    
    return new Address(props);
  }

  public format(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.postalCode}, ${this.country}`;
  }
}
```

#### Money Value Object Example

```typescript
// domain/shared/Money.ts
import { ValueObject } from './ValueObject';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  public add(money: Money): Money {
    if (money.currency !== this.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    
    return Money.create({
      amount: this.amount + money.amount,
      currency: this.currency
    });
  }

  public subtract(money: Money): Money {
    if (money.currency !== this.currency) {
      throw new Error('Cannot subtract money with different currencies');
    }
    
    return Money.create({
      amount: this.amount - money.amount,
      currency: this.currency
    });
  }

  public static create(props: MoneyProps): Money {
    if (props.amount === undefined || props.currency === undefined) {
      throw new Error('Money must have an amount and currency');
    }
    
    return new Money(props);
  }

  public format(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}
```

#### Enumeration Value Object (OrderStatus)

```typescript
// domain/order/OrderStatus.ts
import { ValueObject } from '../shared/ValueObject';

export enum OrderStatusValue {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

interface OrderStatusProps {
  value: OrderStatusValue;
}

export class OrderStatus extends ValueObject<OrderStatusProps> {
  private constructor(props: OrderStatusProps) {
    super(props);
  }

  get value(): OrderStatusValue {
    return this.props.value;
  }

  public static create(status: OrderStatusValue): OrderStatus {
    return new OrderStatus({ value: status });
  }

  public static pending(): OrderStatus {
    return new OrderStatus({ value: OrderStatusValue.PENDING });
  }

  public static processing(): OrderStatus {
    return new OrderStatus({ value: OrderStatusValue.PROCESSING });
  }

  public static shipped(): OrderStatus {
    return new OrderStatus({ value: OrderStatusValue.SHIPPED });
  }

  public static delivered(): OrderStatus {
    return new OrderStatus({ value: OrderStatusValue.DELIVERED });
  }

  public static cancelled(): OrderStatus {
    return new OrderStatus({ value: OrderStatusValue.CANCELLED });
  }

  public isPending(): boolean {
    return this.props.value === OrderStatusValue.PENDING;
  }

  public isProcessing(): boolean {
    return this.props.value === OrderStatusValue.PROCESSING;
  }

  public isShipped(): boolean {
    return this.props.value === OrderStatusValue.SHIPPED;
  }

  public isDelivered(): boolean {
    return this.props.value === OrderStatusValue.DELIVERED;
  }

  public isCancelled(): boolean {
    return this.props.value === OrderStatusValue.CANCELLED;
  }
}
```

## Domain Events and Event Bus

### Concepts

Domain Events are objects that represent something that happened in the domain. They're used to communicate between different parts of the application, especially across aggregate boundaries.

An Event Bus is a mechanism to deliver events to interested parties (subscribers/handlers).

### Code Examples

#### Domain Event Base Class

```typescript
// domain/shared/DomainEvent.ts
import { UniqueEntityID } from './UniqueEntityID';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly aggregateId: UniqueEntityID;

  constructor(aggregateId: UniqueEntityID) {
    this.eventId = UniqueEntityID.create().toString();
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
  }

  abstract get eventName(): string;
}
```

#### Example Domain Event

```typescript
// domain/user/events/UserCreatedEvent.ts
import { DomainEvent } from '../../shared/DomainEvent';
import { User } from '../User';

export class UserCreatedEvent extends DomainEvent {
  public readonly user: User;

  constructor(user: User) {
    super(user.id);
    this.user = user;
  }

  get eventName(): string {
    return 'user.created';
  }
}
```

#### Domain Events Manager

```typescript
// domain/shared/DomainEvents.ts
import { AggregateRoot } from './AggregateRoot';
import { DomainEvent } from './DomainEvent';

type DomainEventHandler = (event: DomainEvent) => void;

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventHandler[]> = {};
  private static markedAggregates: AggregateRoot<any>[] = [];

  public static markAggregateForDispatch(aggregate: AggregateRoot<any>): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<any>): void {
    aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event));
  }

  private static removeAggregateFromMarkedDispatchList(aggregate: AggregateRoot<any>): void {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
    this.markedAggregates.splice(index, 1);
  }

  private static findMarkedAggregateByID(id: UniqueEntityID): AggregateRoot<any> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id));
  

