import { InvalidIdentifier } from './error/invalid-identifier.error'
import { PrimitiveValueObject } from '../primitive-value-object'

/**
 * @description A value object that represents a UUID.
 * @example
 * const uuid = new Uuid('123e4567-e89b-12d3-a456-426614174000')
 */
export class Uuid extends PrimitiveValueObject<string> {
	private static readonly UUID_REGEX =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

	/**
	 * @description Creates a new Uuid instance.
	 * @param value - The UUID.
	 */
	constructor(value: string) {
		super(value.toLowerCase())
		if (!this.validate(this.value)) {
			throw new InvalidIdentifier(Uuid, {
				uuid: this.value,
			})
		}
	}

	/**
	 * @description Checks if a value is a valid UUID.
	 * @param value - The value to check.
	 * @returns True if the value is a valid UUID, false otherwise.
	 */
	static isValid(value: string): boolean {
		return Uuid.UUID_REGEX.test(value)
	}

	validate(value: string): boolean {
		return Uuid.UUID_REGEX.test(value)
	}

	/**
	 * @description Generates a new UUID.
	 * @returns A new Uuid instance.
	 */
	static generate(): Uuid {
		return new Uuid(crypto.randomUUID())
	}
}
