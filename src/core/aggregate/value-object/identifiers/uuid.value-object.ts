import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

export class Uuid extends ValueObject<string> {
	private static readonly UUID_REGEX =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

	constructor(value: string) {
		super(value.toLowerCase())
		if (!this.validate(this.value)) {
			throw new InvalidValueObject('Invalid UUID format')
		}
	}

	static isValid(value: string): boolean {
		return Uuid.UUID_REGEX.test(value)
	}

	protected validate(value: string): boolean {
		return Uuid.UUID_REGEX.test(value)
	}

	static generate(): Uuid {
		return new Uuid(crypto.randomUUID())
	}
}
