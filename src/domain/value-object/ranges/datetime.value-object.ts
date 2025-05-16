import { ValueObject } from '../value-object'
import { InvalidValueObject } from '../errors/invalid-value-object.error'

/**
 * @description A value object that represents a date and time.
 * @example
 * const date = new DateTime('2021-01-01T00:00:00Z')
 * const date2 = new DateTime(new Date())
 * const date3 = new DateTime(1612320000000)
 */
export class DateTime extends ValueObject<Date> {
	/**
	 * @description Creates a new DateTime instance.
	 * @param value - The date to wrap.
	 */
	constructor(value: Date | string | number) {
		let date: Date
		if (typeof value === 'string') {
			date = new Date(value)
		} else if (typeof value === 'number') {
			date = new Date(value)
		} else {
			date = value
		}
		super(date)
		if (!this.validate(date)) {
			throw new InvalidValueObject(DateTime, value)
		}
	}

	protected validate(value: Date): boolean {
		return !isNaN(value.getTime())
	}

	toISOString(): string {
		return this.value.toISOString()
	}

	timestamp(): number {
		return this.value.getTime()
	}

	/**
	 * @description Checks if the date is before the other date.
	 * @param other - The other date.
	 * @returns True if the date is before the other date, false otherwise.
	 */
	isBefore(other: DateTime): boolean {
		return this.value.getTime() < other.value.getTime()
	}

	/**
	 * @description Checks if the date is after the other date.
	 * @param other - The other date.
	 * @returns True if the date is after the other date, false otherwise.
	 */
	isAfter(other: DateTime): boolean {
		return this.value.getTime() > other.value.getTime()
	}

	/**
	 * @description Checks if the date is equal to the other date.
	 * @param other - The other date.
	 * @returns True if the date is equal to the other date, false otherwise.
	 */
	equals(other: DateTime): boolean {
		return this.value.getTime() === other.value.getTime()
	}

	/**
	 * @description Gets the date part of the date.
	 * @returns The date part of the date.
	 */
	get date(): string {
		return this.value.toISOString().split('T')[0]
	}

	/**
	 * @description Gets the year part of the date.
	 * @returns The year part of the date.
	 */
	get year(): number {
		return this.value.getFullYear()
	}
}
