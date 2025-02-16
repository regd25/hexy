import { InvalidValueObjectError } from '../errors/invalid-value-object-error'
import { DecimalValueObject } from '../primitives/decimal-value-object'

export class AmountValueObject extends DecimalValueObject {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError(`Invalid value for amount value object`)
		}
	}
}
