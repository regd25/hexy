import { EnumValueObject, InvalidValueObjectError } from "../../value-objects"

export const FilterOperators = {
  EQUAL: '=',
  NOT_EQUAL: '!=',
  GT: '>',
  LT: '<',
  CONTAINS: 'CONTAINS',
  NOT_CONTAINS: 'NOT_CONTAINS',
} as const

/**
 * Represents a filter operator that can be used to filter a value.
 */
export class FilterOperator extends EnumValueObject<typeof FilterOperators> {
	constructor(value: keyof typeof FilterOperators) {
		super(value, FilterOperators)
    if (!this.validate(value)) {
      throw new InvalidValueObjectError('Invalid filter operator')
    }
  }
} 