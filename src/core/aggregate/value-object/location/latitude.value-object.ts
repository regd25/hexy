import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

export class Latitude extends ValueObject<number> {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject('Invalid latitude value')
		}
	}

	protected validate(value: number): boolean {
		return value >= -90 && value <= 90
	}
}
