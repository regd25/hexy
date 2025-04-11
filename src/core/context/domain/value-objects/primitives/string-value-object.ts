import { ValueObject } from '../value-object'

/**
 * Base class for string value objects with common validations
 */

export abstract class StringValueObject extends ValueObject<string> {
	/**
	 * Creates a trimmed string value object
	 * @param value - The input string
	 */
	constructor(value: string) {
		super(value.trim())
	}

	protected validate(value: string): boolean {
		return value.length > 0 && /^[\s\S]*$/.test(value)
	}

	/**
	 * Gets the string length
	 */
	get length(): number {
		return this.value.length
	}
}
