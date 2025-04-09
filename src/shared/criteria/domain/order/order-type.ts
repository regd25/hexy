import { EnumValueObject, InvalidValueObjectError } from 'shared/core'

/**
 * Represents an order type that can be used to order a collection of items.
 */
export const OrderTypes = {
	ASC: 'ASC',
	DESC: 'DESC',
} as const

export class OrderType extends EnumValueObject<typeof OrderTypes> {
	constructor(value: keyof typeof OrderTypes) {
		super(value, OrderTypes)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid order type')
		}
	}

	fromPrimitives(value: keyof typeof OrderTypes): OrderType {
		return new OrderType(value)
	}
}
