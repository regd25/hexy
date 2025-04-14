import { TimeValueObject } from './time-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'
import { ValueObject } from '../value-object'

type TimeRange = {
	start: TimeValueObject
	end: TimeValueObject
}

export class TimeRangeValueObject extends ValueObject<TimeRange> {
	constructor(start: TimeValueObject, end: TimeValueObject) {
		super({ start, end })
		if (start.toSeconds() > end.toSeconds()) {
			throw new InvalidValueObjectError('Start time must be before end time')
		}
	}

	protected validate(value: TimeRange): boolean {
		return value.start.toSeconds() <= value.end.toSeconds()
	}

	includes(time: TimeValueObject): boolean {
		const target = time.toSeconds()
		return (
			target >= this.value.start.toSeconds() &&
			target <= this.value.end.toSeconds()
		)
	}

	durationInMinutes(): number {
		return (this.value.end.toSeconds() - this.value.start.toSeconds()) / 60
	}
}
