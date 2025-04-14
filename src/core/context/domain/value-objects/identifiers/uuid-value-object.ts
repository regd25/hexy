import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class UuidValueObject extends StringValueObject {
	private static readonly UUID_REGEX =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

	constructor(value: string) {
		super(value.toLowerCase())
		if (!this.validate(this.value)) {
			throw new InvalidValueObjectError('Invalid UUID format')
		}
	}

	static isValid(value: string): boolean {
		return UuidValueObject.UUID_REGEX.test(value)
	}

	protected validate(value: string): boolean {
		return UuidValueObject.UUID_REGEX.test(value)
	}

	static generate(): UuidValueObject {
		return new UuidValueObject(crypto.randomUUID())
	}
}
