import { DomainError } from '@/domain'

export class InvalidTaskDataError extends DomainError {
	constructor() {
		super('Invalid task data')
	}
}
