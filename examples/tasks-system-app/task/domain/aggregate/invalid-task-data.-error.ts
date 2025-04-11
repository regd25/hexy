import { DomainError } from 'src/core/context'

export class InvalidTaskDataError extends DomainError {
	constructor() {
		super('Invalid task data')
	}
}
