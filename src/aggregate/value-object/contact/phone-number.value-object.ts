import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { PrimitiveValueObject } from '../primitive-value-object'

/**
 * Represents an international phone number
 */
export class PhoneNumber extends PrimitiveValueObject<string> {
	private static readonly PHONE_REGEX = /^\+(?:[0-9]\x20?){6,14}[0-9]$/

	constructor(value: string) {
		super(value.replace(/[\s-]/g, '')) // Normaliza el número
		if (!this.validate(this.value)) {
			throw new InvalidValueObject(PhoneNumber, value)
		}
	}

	protected validate(value: string): boolean {
		return PhoneNumber.PHONE_REGEX.test(value)
	}

	/**
	 * Formats the number with spaces
	 */
	toFormattedString(): string {
		return this.value.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, '$1 ')
	}

	/**
	 * Gets the country calling code
	 */
	get countryCode(): string {
		return this.value.substring(0, this.value.length - 10)
	}
}
