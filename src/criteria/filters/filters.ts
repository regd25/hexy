import { PrimitiveValueObject } from '@/aggregate'
import { Filter } from './filter'
import type { FilterOperators } from './filter-operator'

/**
 * Represents a collection of filters that can be used to filter a collection of items.
 */
export class Filters extends PrimitiveValueObject<Filter[]> {
	static fromPrimitives(
		filters: Array<{
			field: string
			operator: FilterOperators
			value: any
		}>,
	): Filters {
		return new Filters(filters.map(Filter.fromPrimitives))
	}

	static none(): Filters {
		return new Filters([])
	}

	validate(value: Filter[]): boolean {
		return value.every((filter) => filter instanceof Filter)
	}

	toPrimitives(): Array<{
		field: string
		operator: FilterOperators
		value: any
	}> {
		return this.value.map((filter) => filter.toPrimitives())
	}

	isEmpty(): boolean {
		return this.value.length === 0
	}
}
