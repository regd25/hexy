import { ValueObject } from '@/domain/aggregate'

/**
 * Represents an order type that can be used to order a collection of items.
 */
export enum OrderTypes {
	ASC = 'ASC',
	DESC = 'DESC',
}

export class OrderType extends ValueObject<OrderTypes> {
	validate(value: OrderTypes): boolean {
		return Object.values(OrderTypes).includes(value)
	}

	static fromPrimitives(value: OrderTypes): OrderType {
		return new OrderType(value)
	}
}
