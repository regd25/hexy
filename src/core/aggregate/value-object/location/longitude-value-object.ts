import { DecimalValueObject } from '../primitives/decimal-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class LongitudeValueObject extends DecimalValueObject {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid longitude value')
		}
	}

	protected validate(value: number): boolean {
		return value >= -180 && value <= 180
	}
}
