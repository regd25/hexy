import { ValueObject } from '@/domain/aggregate'

/**
 * Represents a filter field that can be used to filter a value.
 */
export class FilterField extends ValueObject<string> {
	validate(value: string): boolean {
		return typeof value === 'string'
	}
}
