import { ValueObject } from '../value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class DateValueObject extends ValueObject<Date> {
	constructor(value: Date | string) {
		const date = typeof value === 'string' ? new Date(value) : value
		super(date)

		if (isNaN(date.getTime())) {
			throw new InvalidValueObjectError('Invalid date')
		}
	}

	protected validate(value: Date): boolean {
		return !isNaN(value.getTime())
	}

	timestamp(): number {
		return this.value.getTime()
	}

	toISOString(): string {
		return this.value.toISOString().split('T')[0]
	}

	isBefore(other: DateValueObject): boolean {
		return this.value < other.value
	}

	isAfter(other: DateValueObject): boolean {
		return this.value > other.value
	}
}
