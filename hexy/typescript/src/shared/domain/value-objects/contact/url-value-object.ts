import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

/**
 * Represents a validated URL
 */
export class UrlValueObject extends StringValueObject {
	constructor(value: string) {
		try {
			const url = new URL(value)
			super(url.toString())
		} catch {
			throw new InvalidValueObjectError('Invalid URL format')
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
