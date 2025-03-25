import { StringValueObject, DomainError } from 'hexy/domain'

export class TaskDescription extends StringValueObject {
	constructor(value: string) {
		super(value)
		if (value && value.length > 500) {
			throw new DomainError('Task description cannot exceed 500 characters')
		}
	}
}
