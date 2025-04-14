import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class CityValueObject extends StringValueObject {
	private static readonly CITY_REGEX = /^[A-Za-z\s\-\'\.]{2,100}$/

	constructor(value: string) {
		super(value.trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObjectError('Invalid city name')
		}
	}

	protected validate(value: string): boolean {
		return CityValueObject.CITY_REGEX.test(value)
	}
}
