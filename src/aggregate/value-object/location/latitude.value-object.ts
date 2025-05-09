import { PrimitiveValueObject } from '../primitive-value-object'
import { InvalidLocation } from './error/invalid-location.error'

export class Latitude extends PrimitiveValueObject<number> {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidLocation(this)
		}
	}

	protected validate(value: number): boolean {
		return value >= -90 && value <= 90
	}
}
