import { ValueObject } from '../value-object'
import { InvalidLocation } from './error/invalid-location.error'

export class Latitude extends ValueObject<number> {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidLocation(Latitude, { latitude: value.toString() })
		}
	}

	validate(value: number): boolean {
		return value >= -90 && value <= 90
	}
}
