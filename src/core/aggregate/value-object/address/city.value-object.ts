import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

// TODO: Add @ValueObject decorator once context is defined
export class City extends ValueObject<string> {
	private static readonly CITY_REGEX = /^[A-Za-z\s\-\'\.]{2,100}$/

	constructor(value: string) {
		super(value.trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObject('Invalid city name')
		}
	}

	protected validate(value: string): boolean {
		return City.CITY_REGEX.test(value)
	}
}
