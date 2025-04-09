import { ValueObject, InvalidValueObjectError } from 'shared/core'

export type FilterValuePrimitive =
	| string
	| number
	| boolean
	| Date
	| null
	| string[]
	| number[]
/**
 * Represents a filter value that can be a string, number, boolean, Date, null, or an array of strings or numbers.
 */
export class FilterValue extends ValueObject<FilterValuePrimitive> {
	constructor(value: FilterValuePrimitive) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid filter value')
		}
	}

	protected validate(value: FilterValuePrimitive): boolean {
		if (
			typeof value === 'string' ||
			typeof value === 'number' ||
			typeof value === 'boolean' ||
			value instanceof Date
		) {
			return true
		}

		if (Array.isArray(value)) {
			return value.every(
				(item) => typeof item === 'string' || typeof item === 'number',
			)
		}

		return false
	}
}
