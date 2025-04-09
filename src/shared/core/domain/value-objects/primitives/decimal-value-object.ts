import { ValueObject } from '../value-object'

/**
 * Represents a validated decimal number
 */
export abstract class DecimalValueObject extends ValueObject<number> {
	constructor(value: number) {
		super(value)
	}

	protected validate(value: number): boolean {
		return !isNaN(value) && isFinite(value)
	}

	/**
	 * Rounds to specified decimal places
	 * @param precision - Number of decimal places (default: 2)
	 */
	toFixed(precision = 2): string {
		return this.value.toFixed(precision)
	}

	/**
	 * Performs currency-safe arithmetic operations
	 * @param value - Value to operate with
	 * @param fn - Arithmetic function
	 */
	protected operateWith(
		value: DecimalValueObject | number,
		fn: (a: number, b: number) => number,
	): number {
		const operand = typeof value === 'number' ? value : value.value
		return fn(this.value, operand)
	}
}
