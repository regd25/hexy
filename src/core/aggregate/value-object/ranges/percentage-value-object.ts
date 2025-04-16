import { DecimalValueObject } from '../primitives/decimal-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class PercentageValueObject extends DecimalValueObject {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Percentage out of range (0-100)')
		}
	}

	protected validate(value: number): boolean {
		return super.validate(value) && value >= 0 && value <= 100
	}

	toFormattedString(decimalPlaces = 2): string {
		return `${super.toFixed(decimalPlaces)}%`
	}
}
