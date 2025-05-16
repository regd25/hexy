import { ValueObject } from '@/domain/aggregate'

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
	validate(value: FilterValuePrimitive): boolean {
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
