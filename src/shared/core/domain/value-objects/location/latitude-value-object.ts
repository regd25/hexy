import { InvalidValueObjectError } from '../errors/invalid-value-object-error'
import { DecimalValueObject } from '../primitives/decimal-value-object'

export class LatitudeValueObject extends DecimalValueObject {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid latitude value')
		}
	}

	protected validate(value: number): boolean {
		return value >= -90 && value <= 90
	}
}
