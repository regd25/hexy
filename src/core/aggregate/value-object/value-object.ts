import { DomainValueObject } from 'src/core/di'

@DomainValueObject()
export abstract class ValueObject<T> {
	protected readonly value: T

	/**
	 * Creates a new ValueObject instance
	 * @param value - The primitive value to wrap
	 * @throws {Error} If validation fails
	 */
	constructor(value: T) {
		if (!this.validate(value)) {
			throw new Error(
				`Invalid value for ${this.constructor.name}: ${JSON.stringify(value)}`,
			)
		}
		this.value = Object.freeze(value) // Inmutabilidad garantizada
	}

	/**
	 * Validates the value object's data
	 * @param value - The value to validate
	 * @returns {boolean} True if valid, false otherwise
	 */
	protected abstract validate(value: T): boolean

	/**
	 * Compares two value objects for equality
	 * @param other - The value object to compare with
	 * @returns {boolean} True if values are structurally equal
	 */
	public equals(other: ValueObject<T>): boolean {
		return JSON.stringify(this.value) === JSON.stringify(other.value)
	}

	/**
	 * Returns the primitive value
	 * @returns {T} The underlying primitive value
	 */
	public toPrimitive(): T {
		return this.value
	}

	/**
	 * String representation of the value object
	 * @returns {string} The stringified value
	 */
	public toString(): string {
		return String(this.value)
	}
}
