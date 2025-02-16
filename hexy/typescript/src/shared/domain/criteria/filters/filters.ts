import { ValueObject, InvalidValueObjectError } from '../../value-objects'
import { Filter } from './filter'

/**
 * Represents a collection of filters that can be used to filter a collection of items.
 */
export class Filters extends ValueObject<Filter[]> {
	constructor(filters: Filter[]) {
		super(filters)
		if (!this.validate(filters)) {
			throw new InvalidValueObjectError('Invalid filters')
		}
	}

	static fromPrimitives(
		filters: Array<{
			field: string
			operator: string
			value: any
		}>,
	): Filters {
		return new Filters(filters.map(Filter.fromPrimitives))
	}

	protected validate(value: Filter[]): boolean {
		return value.every((filter) => filter instanceof Filter)
	}

	toPrimitives(): Array<{
		field: string
		operator: string
		value: any
	}> {
		return this.value.map((filter) => filter.toPrimitives())
	}

	isEmpty(): boolean {
		return this.value.length === 0
	}
}
