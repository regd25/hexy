import { PrimitiveValueObject } from '../primitive-value-object'
import { InvalidLocation } from './error/invalid-location.error'

export class City extends PrimitiveValueObject<string> {
	private static readonly CITY_REGEX = /^[A-Za-z\s\-\'\.]{2,100}$/

	constructor(value: string) {
		super(value.trim())
		if (!this.validate(this.value)) {
			throw new InvalidLocation(this)
		}
	}

	protected validate(value: string): boolean {
		return City.CITY_REGEX.test(value)
	}
}
