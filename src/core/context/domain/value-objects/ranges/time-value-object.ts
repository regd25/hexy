import { InvalidValueObjectError } from '../errors/invalid-value-object-error'
import { StringValueObject } from '../primitives/string-value-object'

export class TimeValueObject extends StringValueObject {
	private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/

	constructor(value: string) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid time format (HH:MM:SS)')
		}
	}

	protected validate(value: string): boolean {
		return TimeValueObject.TIME_REGEX.test(value)
	}

	toSeconds(): number {
		const [hours, minutes, seconds = 0] = this.value.split(':').map(Number)
		return hours * 3600 + minutes * 60 + seconds
	}
}
