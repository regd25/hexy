import { StringValueObject, DomainError } from 'src/core/context'

export class TaskTitle extends StringValueObject {
	constructor(value: string) {
		super(value)
		if (!value || value.trim() === '') {
			throw new DomainError('Task title cannot be empty')
		}
		if (value.length > 50) {
			throw new DomainError('Task title cannot exceed 50 characters')
		}
	}
}
