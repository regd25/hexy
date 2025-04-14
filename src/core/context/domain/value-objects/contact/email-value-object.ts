import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

/**
 * Represents a validated email address
 */
export class EmailValueObject extends StringValueObject {
	private static readonly EMAIL_REGEX =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

	constructor(value: string) {
		super(value.toLowerCase().trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObjectError('Invalid email format')
		}
	}

	protected validate(value: string): boolean {
		return EmailValueObject.EMAIL_REGEX.test(value)
	}

	/**
	 * Gets the domain part of the email
	 */
	get domain(): string {
		return this.value.split('@')[1]
	}

	/**
	 * Gets the local part of the email (before @)
	 */
	get localPart(): string {
		return this.value.split('@')[0]
	}
}
