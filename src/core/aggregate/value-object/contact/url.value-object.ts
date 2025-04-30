import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

/**
 * Represents a validated URL
 */
export class Url extends ValueObject<string> {
	constructor(value: string) {
		try {
			const url = new URL(value)
			super(url.toString())
		} catch {
			throw new InvalidValueObject('Invalid URL format')
		}
	}

	protected validate(value: string): boolean {
		try {
			new URL(value)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Gets the URL domain
	 */
	get domain(): string {
		return new URL(this.value).hostname
	}

	/**
	 * Gets the URL protocol
	 */
	get protocol(): string {
		return new URL(this.value).protocol.replace(':', '')
	}
}
