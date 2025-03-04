import { EnumValueObject, InvalidValueObjectError } from '../../value-objects'

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
export class FilterOperator extends EnumValueObject<typeof FilterOperators> {
	constructor(value: typeof FilterOperators) {
		super(FilterOperators[value], Object.values(FilterOperators))
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid filter operator')
		}
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
