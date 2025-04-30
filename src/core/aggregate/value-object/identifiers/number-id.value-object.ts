import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

export class NumberId extends ValueObject<number> {
	static readonly INTEGER_REGEX = /^\d+$/

	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject('Invalid ID format')
		}
	}

	static isValid(value: number): boolean {
		return (
			NumberId.INTEGER_REGEX.test(value.toString()) &&
			value > 0 &&
			Number.isInteger(value) &&
			!Number.isNaN(value)
		)
	}

	protected validate(value: number): boolean {
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
