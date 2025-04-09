import { ValueObject, InvalidValueObjectError } from 'shared/core'
import { OrderBy } from './order-by'
import { OrderType, OrderTypes } from './order-type'

export type OrderPrimitive = {
	orderBy: string
	orderType: string
}

/**
 * Represents an order that can be used to order a collection of items.
 */
export class Order extends ValueObject<{
	orderBy: OrderBy
	orderType: OrderType
}> {
	constructor(orderBy: OrderBy, orderType: OrderType) {
		super({ orderBy, orderType })
		if (!this.validate({ orderBy, orderType })) {
			throw new InvalidValueObjectError('Invalid order')
		}
	}

	protected validate(value: {
		orderBy: OrderBy
		orderType: OrderType
	}): boolean {
		return (
			value.orderBy instanceof OrderBy && value.orderType instanceof OrderType
		)
	}

	static fromPrimitives(primitives: OrderPrimitive): Order {
		return new Order(
			new OrderBy(primitives.orderBy),
			new OrderType(primitives.orderType as keyof typeof OrderTypes),
		)
	}

	toPrimitives(): OrderPrimitive {
		return {
			orderBy: this.value.orderBy.toString(),
			orderType: this.value.orderType.toString(),
		}
	}

	static none(): Order {
		return new Order(OrderBy.none(), new OrderType('ASC'))
	}

	hasOrder(): boolean {
		return this.value.orderBy.toString() !== ''
	}
}
