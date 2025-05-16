import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'
import type { Time} from './time.value-object'

/**
 * @description A value object that represents a time range.
 * @example
 * const timeRange = new TimeRange(new Time(10), new Time(20))
 */
export class TimeRange extends ValueObject<{
	start: Time
	end: Time
}> {
	/**
	 * @description Creates a new TimeRange instance.
	 * @param start - The start time.
	 * @param end - The end time.
	 */
	constructor(start: Time, end: Time) {
		super({ start, end })
		if (start.toSeconds() > end.toSeconds()) {
			throw new InvalidValueObject(TimeRange, { start, end })
		}
	}

	protected validate(value: { start: Time; end: Time }): boolean {
		return value.start.toSeconds() <= value.end.toSeconds()
	}

	/**
	 * @description Checks if the time is within the range.
	 * @param time - The time to check.
	 * @returns True if the time is within the range, false otherwise.
	 */
	includes(time: Time): boolean {
		const target = time.toSeconds()
		return (
			target >= this.value.start.toSeconds() &&
			target <= this.value.end.toSeconds()
		)
	}

	/**
	 * @description Gets the duration of the range in minutes.
	 * @returns The duration of the range in minutes.
	 */
	durationInMinutes(): number {
		return (this.value.end.toSeconds() - this.value.start.toSeconds()) / 60
	}

	/**
	 * @description Returns the time range as a string.
	 * @returns The time range as a string.
	 */
	toString(): string {
		return `${this.value.start.toString()} - ${this.value.end.toString()}`
	}
}
