import 'reflect-metadata'
import { Injectable } from '../injectable'

export const INFRASTRUCTURE_LAYER_KEY = 'infrastructure:layer'
export const INFRASTRUCTURE_REPOSITORY_KEY = 'infrastructure:repository'
export const INFRASTRUCTURE_SERVICE_KEY = 'infrastructure:service'
export const INFRASTRUCTURE_DAO_KEY = 'infrastructure:dao'
/**
 * Decorator for services in the Infrastructure layer.
 * The Infrastructure layer contains implementations of interfaces defined in the domain layer,
 * such as repositories, API clients, and other external services.
 *
 * @example
 * ```typescript
 * @InfrastructureService()
 * export class OrderRepositoryImpl implements OrderRepository {
 *   constructor(private readonly database: Database) {}
 *
 *   async findById(id: string): Promise<Order | null> {
 *     // Infrastructure implementation - database access
 *     const data = await this.database.query('SELECT * FROM orders WHERE id = ?', [id]);
 *     return data ? Order.fromPrimitives(data) : null;
 *   }
 *
 *   async save(order: Order): Promise<void> {
 *     // Infrastructure implementation - database access
 *     await this.database.query('INSERT INTO orders VALUES (?)', [order.toPrimitives()]);
 *   }
 * }
 * ```
 */
export function InfrastructureService(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(INFRASTRUCTURE_SERVICE_KEY, true, target)
		return Injectable()(target)
	}
}

/**
 * Function to check if a class is an Infrastructure Service
 */
export function isInfrastructureService(target: any): boolean {
	return Reflect.getMetadata(INFRASTRUCTURE_SERVICE_KEY, target) === true
}

/**
 * Decorator specifically for Repository implementations in the Infrastructure layer.
 *
 * @example
 * ```typescript
 * @InfrastructureRepository()
 * export class MongoOrderRepository implements OrderRepository {
 *   // Implementation details using MongoDB
 * }
 * ```
 */
export function InfrastructureRepository(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(INFRASTRUCTURE_REPOSITORY_KEY, true, target)
		return Injectable()(target)
	}
}

export function isInfrastructureRepository(target: any): boolean {
	return Reflect.getMetadata(INFRASTRUCTURE_REPOSITORY_KEY, target) === true
}

/**
 * Decorator for DAO implementations in the Infrastructure layer.
 *
 * @example
 * ```typescript
 * @InfrastructureDao()
 * export class MongoOrderDao implements OrderDao {
 *   // Implementation details using MongoDB
 * }
 * ```
 */
export function InfrastructureDao(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(INFRASTRUCTURE_DAO_KEY, true, target)
		return Injectable()(target)
	}
}

export function isInfrastructureDao(target: any): boolean {
	return Reflect.getMetadata(INFRASTRUCTURE_DAO_KEY, target) === true
}
