import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { PrimitiveValueObject } from '../primitive-value-object'
import { DateTime } from './datetime.value-object'

/**
 * @description A value object that represents a date range.
 * @example
 * const dateRange = new DateRange(new DateTime('2021-01-01'), new DateTime('2021-01-05'))
 */
export class DateRange extends PrimitiveValueObject<{
	start: DateTime
	end: DateTime
}> {
	/**
	 * @description Creates a new DateRange instance.
	 * @param start - The start date.
	 * @param end - The end date.
	 */
	constructor(start: DateTime, end: DateTime) {
		super({ start, end })
		if (!this.validate({ start, end })) {
			throw new InvalidValueObject(DateRange, { start, end })
		}
	}

	protected validate(value: { start: DateTime; end: DateTime }): boolean {
		if (value.start.isAfter(value.end)) {
			throw new InvalidValueObject(DateRange, {
				start: value.start,
				end: value.end,
			})
		}
		return value.start.isBefore(value.end) || value.start.equals(value.end)
	}

	/**
	 * @description Checks if the date is within the range.
	 * @param date - The date to check.
	 * @returns True if the date is within the range, false otherwise.
	 */
	includes(date: DateTime): boolean {
		return !date.isBefore(this.value.start) && !date.isAfter(this.value.end)
	}

	/**
	 * @description Gets the duration of the range in days.
	 * @returns The duration of the range in days.
	 */
	durationInDays(): number {
		const diff = this.value.end.timestamp() - this.value.start.timestamp()
		return Math.ceil(diff / (1000 * 3600 * 24))
	}
}
