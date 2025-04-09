import { IntegerValueObject } from '../primitives/integer-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class NumberIdValueObject extends IntegerValueObject {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid ID format')
		}
	}

	static isValid(value: number): boolean {
		return (
			super.INTEGER_REGEX.test(value.toString()) &&
			value > 0 &&
			Number.isInteger(value) &&
			!Number.isNaN(value)
		)
	}

	protected validate(value: number): boolean {
		return (
			super.validate(value) &&
			value > 0 &&
			Number.isInteger(value) &&
			!Number.isNaN(value)
		)
	}

	toString(): string {
		return this.value.toString().padStart(10, '0')
	}
}
