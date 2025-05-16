import { ValueObject } from '../value-object'
import { InvalidLocation } from './error/invalid-location.error'

export class Longitude extends ValueObject<number> {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidLocation(Longitude, { longitude: value.toString() })
		}
	}

	validate(value: number): boolean {
		return value >= -180 && value <= 180
	}
}
