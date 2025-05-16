import { ValueObject } from '@/domain/aggregate'

export enum FilterOperators {
	EQUAL = '=',
	NOT_EQUAL = '!=',
	GT = '>',
	LT = '<',
	CONTAINS = 'CONTAINS',
	NOT_CONTAINS = 'NOT_CONTAINS',
}

/**
 * Represents a filter operator that can be used to filter a value.
 */
export class FilterOperator extends ValueObject<FilterOperators> {
	validate(value: FilterOperators): boolean {
		return Object.values(FilterOperators).includes(value)
	}

	static equal() {
		return new FilterOperator(FilterOperators.EQUAL)
	}

	static notEqual() {
		return new FilterOperator(FilterOperators.NOT_EQUAL)
	}

	static greaterThan() {
		return new FilterOperator(FilterOperators.GT)
	}

	static lessThan() {
		return new FilterOperator(FilterOperators.LT)
	}
}
