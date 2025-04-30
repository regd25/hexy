import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

export class Longitude extends ValueObject<number> {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject('Invalid longitude value')
		}
	}

	protected validate(value: number): boolean {
		return value >= -180 && value <= 180
	}
}
