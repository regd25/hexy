import { DateValueObject } from './date-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'
import { ValueObject } from '../value-object'

type DateRange = {
	start: DateValueObject
	end: DateValueObject
}

export class DateRangeValueObject extends ValueObject<DateRange> {
	constructor(start: DateValueObject, end: DateValueObject) {
		super({ start, end })
		if (start.isAfter(end)) {
			throw new InvalidValueObjectError('Start date must be before end date')
		}
	}

	protected validate(value: DateRange): boolean {
		return value.start.isBefore(value.end) || value.start.equals(value.end)
	}

	includes(date: DateValueObject): boolean {
		return !date.isBefore(this.value.start) && !date.isAfter(this.value.end)
	}

	durationInDays(): number {
		const diff = this.value.end.timestamp() - this.value.start.timestamp()
		return Math.ceil(diff / (1000 * 3600 * 24))
	}
}
