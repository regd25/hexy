import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

/**
 * @description A value object that represents a time.
 * @example
 * const time = new TimeValueObject('12:34:56')
 */
export class Time extends ValueObject<string> {
	private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/

	/**
	 * @description Creates a new TimeValueObject instance.
	 * @param value - The time to wrap.
	 */
	constructor(value: string) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject('Invalid time format (HH:MM:SS)')
		}
	}

	protected validate(value: string): boolean {
		return Time.TIME_REGEX.test(value)
	}

	toSeconds(): number {
		const [hours, minutes, seconds = 0] = this.value.split(':').map(Number)
		return hours * 3600 + minutes * 60 + seconds
	}
}
