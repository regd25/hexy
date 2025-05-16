import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

/**
 * @description A value object that represents a percentage.
 * @example
 * const percentage = new Percentage(50)
 */
export class Percentage extends ValueObject<number> {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject(Percentage, value)
		}
	}

	protected validate(value: number): boolean {
		return value >= 0 && value <= 100
	}

	/**
	 * @description Returns the percentage as a formatted string.
	 * @param decimalPlaces - The number of decimal places to round to.
	 * @returns The percentage as a formatted string.
	 */
	toString(decimalPlaces = 2): string {
		return `${this.value.toFixed(decimalPlaces)}%`
	}
}
