import { ValueObject } from '../value-object'

/**
 * Represents a validated integer value
 */
export abstract class IntegerValueObject extends ValueObject<number> {
	protected static readonly INTEGER_REGEX = /^\d+$/

	protected validate(value: number): boolean {
		return IntegerValueObject.INTEGER_REGEX.test(value.toString())
	}

	/**
	 * Converts to formatted string with thousands separator
	 * @param locale - Locale for formatting (default: en-US)
	 */
	toFormattedString(locale = 'en-US'): string {
		return this.value.toLocaleString(locale)
	}
}
