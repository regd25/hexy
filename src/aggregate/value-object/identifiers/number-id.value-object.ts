import { InvalidIdentifier } from './error/invalid-identifier.error'
import { PrimitiveValueObject } from '../primitive-value-object'

/**
 * @description A value object that represents a number ID.
 * @example
 * const numberId = new NumberId(123)
 */
export class NumberId extends PrimitiveValueObject<number> {
	static readonly INTEGER_REGEX = /^\d+$/

	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidIdentifier(NumberId, {
				numberId: this.value.toString(),
			})
		}
	}

	/**
	 * @description Checks if a value is a valid number ID.
	 * @param value - The value to check.
	 * @returns True if the value is a valid number ID, false otherwise.
	 */
	static isValid(value: number): boolean {
		return (
			NumberId.INTEGER_REGEX.test(value.toString()) &&
			value > 0 &&
			Number.isInteger(value) &&
			!Number.isNaN(value)
		)
	}

	validate(value: number): boolean {
		return (
			NumberId.INTEGER_REGEX.test(value.toString()) &&
			value > 0 &&
			Number.isInteger(value) &&
			!Number.isNaN(value)
		)
	}

	toString(): string {
		return this.value.toString().padStart(10, '0')
	}
}
