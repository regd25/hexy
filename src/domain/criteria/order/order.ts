import { ValueObject } from '@/domain/aggregate'
import { OrderBy } from './order-by'
import { OrderType, OrderTypes } from './order-type'

export type OrderPrimitive = {
	orderBy: string
	orderType: OrderTypes
}

/**
 * Represents an order that can be used to order a collection of items.
 */
export class Order extends ValueObject<{
	orderBy: OrderBy
	orderType: OrderType
}> {
	validate(value: { orderBy: OrderBy; orderType: OrderType }): boolean {
		return (
			value.orderBy instanceof OrderBy && value.orderType instanceof OrderType
		)
	}

	static fromPrimitives(primitives: OrderPrimitive): Order {
		return new Order({
			orderBy: new OrderBy(primitives.orderBy),
			orderType: new OrderType(primitives.orderType),
		})
	}

	toPrimitives(): OrderPrimitive {
		return {
			orderBy: this.value.orderBy.toString(),
			orderType: this.value.orderType.toPrimitive(),
		}
	}

	static none(): Order {
		return new Order({
			orderBy: OrderBy.none(),
			orderType: OrderType.fromPrimitives(OrderTypes.ASC),
		})
	}

	hasOrder(): boolean {
		return this.value.orderBy.toString() !== ''
	}
}
