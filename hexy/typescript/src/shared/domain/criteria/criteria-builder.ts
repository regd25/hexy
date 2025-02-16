import { AndCriteria } from './and-criteria'
import { Criteria } from './criteria'
import { FilterPrimitives } from './filters/filter'
import { OrCriteria } from './or-criteria'

/**
 * Builder class for Criteria objects
 */
export class CriteriaBuilder {
	private filters: FilterPrimitives[] = []
	private orderBy: string = ''
	private orderType: string = 'ASC'
	private limit?: number
	private offset?: number

	addFilter(filter: FilterPrimitives): CriteriaBuilder {
		this.filters.push(filter)
		return this
	}

	addOrderBy(orderBy: string): CriteriaBuilder {
		this.orderBy = orderBy
		return this
	}

	addOrderType(orderType: string): CriteriaBuilder {
		this.orderType = orderType
		return this
	}

	addLimit(limit: number): CriteriaBuilder {
		this.limit = limit
		return this
	}

	addOffset(offset: number): CriteriaBuilder {
		this.offset = offset
		return this
	}

	/**
	 * @description Build a criteria object
	 * @param type - The type of criteria to build
	 * @returns A criteria object
	 */
	build(type: 'or' | 'and' = 'and'): Criteria {
		if (type === 'or') {
			return this.buildOrCriteria()
		}

		return this.buildAndCriteria()
	}

	private buildOrCriteria(): OrCriteria {
		return OrCriteria.fromPrimitives(
			this.filters,
			this.orderBy,
			this.orderType,
			this.limit,
			this.offset,
		)
	}

	private buildAndCriteria(): AndCriteria {
		return AndCriteria.fromPrimitives(
			this.filters,
			this.orderBy,
			this.orderType,
			this.limit,
			this.offset,
		)
	}
}
