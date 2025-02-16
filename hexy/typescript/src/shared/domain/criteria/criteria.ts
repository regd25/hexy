import { ValueObject } from '../value-objects/value-object'
import { FilterPrimitives } from './filters/filter'
import { Filters } from './filters/filters'
import { Order } from './order/order'

/**
 * Represents a criteria that can be used to filter and order a collection of items.
 */
export class Criteria extends ValueObject<{
	filters: Filters
	order: Order
	limit?: number
	offset?: number
}> {
	constructor(filters: Filters, order: Order, limit?: number, offset?: number) {
		super({ filters, order, limit, offset })
	}

	get orderBy(): string {
		return this.value.order.toString()
	}

	get orderType(): string {
		return this.value.order.toString()
	}

	get limit(): number | undefined {
		return this.value.limit
	}

	get offset(): number | undefined {
		return this.value.offset
	}

	static fromPrimitives(
		filters: FilterPrimitives[],
		orderBy: string,
		orderType: string,
		limit?: number,
		offset?: number,
	): Criteria {
		return new Criteria(
			Filters.fromPrimitives(filters),
			Order.fromPrimitives({
				orderBy,
				orderType,
			}),
			limit,
			offset,
		)
	}

	protected validate(value: {
		filters: Filters
		order: Order
		limit?: number
		offset?: number
	}): boolean {
		return (
			value.filters instanceof Filters &&
			value.order instanceof Order &&
			(value.limit === undefined || typeof value.limit === 'number') &&
			(value.offset === undefined || typeof value.offset === 'number')
		)
	}

	hasFilters(): boolean {
		return !this.value.filters.isEmpty()
	}

	hasOrder(): boolean {
		return this.value.order.hasOrder()
	}
}
