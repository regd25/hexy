import { DomainError } from 'hexy'
import { TaskId } from './value-objects'

export class TaskNotFoundError extends DomainError {
	constructor(id: TaskId) {
		super(`Task with ID ${id.toString()} not found`)
	}
}
