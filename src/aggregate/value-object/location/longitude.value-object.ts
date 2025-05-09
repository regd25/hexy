import { PrimitiveValueObject } from '../primitive-value-object'
import { InvalidLocation } from './error/invalid-location.error'

export class Longitude extends PrimitiveValueObject<number> {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidLocation(this)
		}
	}

	protected validate(value: number): boolean {
		return value >= -180 && value <= 180
	}
}
