import { PrimitiveValueObject } from '@/aggregate'

/**
 * Represents a filter field that can be used to filter a value.
 */
export class FilterField extends PrimitiveValueObject<string> {
	validate(value: string): boolean {
		return typeof value === 'string'
	}
}
