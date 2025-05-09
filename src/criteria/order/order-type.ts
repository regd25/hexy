import { PrimitiveValueObject } from '@/aggregate'

/**
 * Represents an order type that can be used to order a collection of items.
 */
export enum OrderTypes {
	ASC = 'ASC',
	DESC = 'DESC',
}

export class OrderType extends PrimitiveValueObject<OrderTypes> {
	validate(value: OrderTypes): boolean {
		return Object.values(OrderTypes).includes(value)
	}

	static fromPrimitives(value: OrderTypes): OrderType {
		return new OrderType(value)
	}
}
