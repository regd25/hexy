import 'reflect-metadata'
import { Injectable } from '../injectable'
import { createToken } from '../token'

export const DOMAIN_SERVICE_KEY = 'domain:service'
export const DOMAIN_ENTITY_KEY = 'domain:entity'
export const DOMAIN_VALUE_OBJECT_KEY = 'domain:value-object'
export const DOMAIN_AGGREGATE_KEY = 'domain:aggregate'
export const DOMAIN_REPOSITORY_KEY = 'domain:repository'
export const DOMAIN_EVENT_KEY = 'domain:event'
export const DOMAIN_REPOSITORY_TOKEN_KEY = 'domain:repository:token'
/**
 * Decorator for services in the Domain layer.
 * The Domain layer contains core business logic, entities, aggregates, and domain services.
 *
 * @example
 * ```typescript
 * @DomainService()
 * export class OrderDomainService {
 *   validate(order: Order): boolean {
 *     // Pure domain logic - validation, calculations, etc.
 *     return order.items.length > 0 && order.total > 0;
 *   }
 *
 *   process(data: OrderData): Order {
 *     // Core domain logic
 *     const order = Order.create(data);
 *     return order;
 *   }
 * }
 * ```
 */
export function DomainService(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(DOMAIN_SERVICE_KEY, true, target)
		return Injectable()(target)
	}
}

/**
 * Function to check if a class is a Domain Service
 */
export function isDomainService(target: any): boolean {
	return Reflect.getMetadata(DOMAIN_SERVICE_KEY, target) === true
}

/**
 * Decorator for repository interfaces in the Domain layer.
 * Repository interfaces define the persistence contracts that will be implemented in the Infrastructure layer.
 *
 * @example
 * ```typescript
 * @Repository()
 * export interface OrderRepository {
 *   findById(id: string): Promise<Order | null>;
 *   save(order: Order): Promise<void>;
 * }
 * ```
 */
export function DomainRepository(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(
			DOMAIN_REPOSITORY_TOKEN_KEY,
			createToken(target),
			target,
		)
		Reflect.defineMetadata(DOMAIN_REPOSITORY_KEY, true, target)
		return target
	}
}

/**
 * Function to check if a class is a Domain Repository
 */
export function isDomainRepository(target: any): boolean {
	return Reflect.getMetadata(DOMAIN_REPOSITORY_KEY, target) === true
}

/**
 * Decorator for domain aggregates in the Domain layer.
 * Aggregates are classes that represent a collection of entities and value objects.
 *
 */
export function DomainAggregate(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(DOMAIN_AGGREGATE_KEY, true, target)
		return Injectable()(target)
	}
}

/**
 * Function to check if a class is a Domain Aggregate
 */
export function isDomainAggregate(target: any): boolean {
	return Reflect.getMetadata(DOMAIN_AGGREGATE_KEY, target) === true
}

/**
 * Decorator for domain entities in the Domain layer.
 * Entities are classes that represent real-world objects with identity and state.
 *
 * @example
 * ```typescript
 * @Entity()
 * export class Order {
 *   constructor(
 *     public readonly id: string,
 *     public readonly items: string[],
 *     public readonly total: number
 *   ) {}
 * }
 */
export function DomainEntity(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(DOMAIN_ENTITY_KEY, true, target)
		return Injectable()(target)
	}
}

/**
 * Function to check if a class is a Domain Entity
 */
export function isDomainEntity(target: any): boolean {
	return Reflect.getMetadata(DOMAIN_ENTITY_KEY, target) === true
}

/**
 * Decorator for domain value objects in the Domain layer.
 * Value objects are classes that represent immutable objects with no identity.
 *
 * @example
 * ```typescript
 * @ValueObject()
 * export class OrderTotal {
 *   constructor(public readonly value: number) {}
 * }
 * ```
 */
export function DomainValueObject(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(DOMAIN_VALUE_OBJECT_KEY, true, target)
		return Injectable()(target)
	}
}

/**
 * Function to check if a class is a Domain Value Object
 */
export function isDomainValueObject(target: any): boolean {
	return Reflect.getMetadata(DOMAIN_VALUE_OBJECT_KEY, target) === true
}

/**
 * Decorator for domain events in the Domain layer.
 * Events are classes that represent domain events.
 *
 */
export function DomainEvent(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(DOMAIN_EVENT_KEY, true, target)
		return Injectable()(target)
	}
}

/**
 * Function to check if a class is a Domain Event
 */
export function isDomainEvent(target: any): boolean {
	return Reflect.getMetadata(DOMAIN_EVENT_KEY, target) === true
}
