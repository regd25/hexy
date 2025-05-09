import { PrimitiveValueObject } from '@/aggregate'

/**
 * Represents an order by field that can be used to order a collection of items.
 */
export class OrderBy extends PrimitiveValueObject<string> {
	validate(value: string): boolean {
		return typeof value === 'string'
	}

	static none(): OrderBy {
		return new OrderBy('')
	}
}
