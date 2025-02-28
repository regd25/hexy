import { ValueObject } from '../value-object'

/**
 * Represents a validated boolean value
 */
export abstract class BooleanValueObject extends ValueObject<boolean> {
	constructor(value: boolean) {
		super(value)
	}

	protected validate(value: boolean): boolean {
		return typeof value === 'boolean'
	}

	/**
	 * Checks if value is true
	 */
	isTrue(): boolean {
		return this.value === true
	}

	/**
	 * Checks if value is false
	 */
	isFalse(): boolean {
		return this.value === false
	}
}
