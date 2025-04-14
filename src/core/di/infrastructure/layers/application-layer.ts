import 'reflect-metadata'
import { Injectable } from '../injectable'

export const APPLICATION_USECASE_KEY = 'application:use-case'
export const APPLICATION_SERVICE_KEY = 'application:service'

/**
 * Decorator for services in the Application layer.
 * The Application layer contains use cases and orchestrates domain logic.
 *
 * @example
 * ```typescript
 * @ApplicationService()
 * export class OrderApplicationService {
 *   constructor(private readonly orderDomainService: OrderDomainService) {}
 *
 *   async createOrder(data: OrderData): Promise<Order> {
 *     // Application logic - orchestration of domain services
 *     return this.orderDomainService.process(data);
 *   }
 * }
 * ```
 */
export function ApplicationService(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(APPLICATION_SERVICE_KEY, true, target)
		return Injectable()(target)
	}
}

/**
 * Function to check if a class is an Application Service
 */
export function isApplicationService(target: any): boolean {
	return Reflect.getMetadata(APPLICATION_SERVICE_KEY, target) === true
}

/**
 * Decorator for use cases in the Application layer.
 * Use cases implement the UseCase abstract class and follow a single responsibility pattern.
 *
 * @example
 * ```typescript
 * @ApplicationUseCase()
 * export class CreateOrderUseCase extends UseCase<CreateOrderInput, Order> {
 *   constructor(
 *     private readonly orderRepository: OrderRepository,
 *     private readonly orderDomainService: OrderDomainService
 *   ) {
 *     super();
 *   }
 *
 *   async execute(input: CreateOrderInput): Promise<Order> {
 *     // Use case implementation
 *     const order = Order.create(input);
 *
 *     // Validate using domain service
 *     if (!this.orderDomainService.validate(order)) {
 *       throw new Error('Invalid order');
 *     }
 *
 *     // Persist using repository
 *     await this.orderRepository.save(order);
 *
 *     return order;
 *   }
 * }
 * ```
 */
export function ApplicationUseCase(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata(APPLICATION_USECASE_KEY, true, target)
		return Injectable()(target)
	}
}

/**
 * Function to check if a class is an Application Use Case
 */
export function isApplicationUseCase(target: any): boolean {
	return Reflect.getMetadata(APPLICATION_USECASE_KEY, target) === true
}
