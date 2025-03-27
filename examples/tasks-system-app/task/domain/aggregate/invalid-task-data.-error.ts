import { DomainError } from '@hexy/domain'

export class InvalidTaskDataError extends DomainError {
	constructor() {
		super('Invalid task data')
	}
}
