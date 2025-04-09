import { StringValueObject } from 'shared/core'

/**
 * Represents an order by field that can be used to order a collection of items.
 */
export class OrderBy extends StringValueObject {
	constructor(value: string) {
		super(value)
	}

	static none(): OrderBy {
		return new OrderBy('')
	}
}
