import { DateValueObject } from './date-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class DateTimeValueObject extends DateValueObject {
	constructor(value: Date | string) {
		super(value)
	}

	toISOString(): string {
		return this.value.toISOString()
	}

	get time(): string {
		return this.value.toISOString().split('T')[1].split('.')[0]
	}

	get date(): string {
		return this.value.toISOString().split('T')[0]
	}

	get year(): number {
		return this.value.getFullYear()
	}
}
