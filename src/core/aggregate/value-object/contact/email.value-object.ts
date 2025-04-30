import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

/**
 * Represents a validated email address
 */
export class Email extends ValueObject<string> {
	private static readonly EMAIL_REGEX =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

	constructor(value: string) {
		super(value.toLowerCase().trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObject('Invalid email format')
		}
	}

	protected validate(value: string): boolean {
		return Email.EMAIL_REGEX.test(value)
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
