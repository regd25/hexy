import { DomainService, Injectable } from 'hexy'
import { Task } from '../aggregate/task'

/**
 * Domain service for Task entities
 * Contains domain logic that doesn't belong in the entity itself
 */
@DomainService()
@Injectable()
export class TaskDomainService {
	/**
	 * Validate a task
	 * @param task - Task to validate
	 * @returns boolean indicating if task is valid
	 */
	validate(task: Task): boolean {
		// A simple validation that could be extended with more complex business rules
		return (
			task.title.toPrimitive().length > 0 &&
			!this.containsForbiddenWords(task.title.toPrimitive()) &&
			!this.containsForbiddenWords(task.description.toPrimitive())
		)
	}

	/**
	 * Check if a task is high priority based on keywords in title
	 * @param task - Task to check
	 * @returns boolean indicating if task is high priority
	 */
	isHighPriority(task: Task): boolean {
		const highPriorityKeywords = ['urgent', 'important', 'critical', 'asap']
		return highPriorityKeywords.some((keyword) =>
			task.title.toPrimitive().toLowerCase().includes(keyword),
		)
	}

	/**
	 * Filter overdue tasks from a list
	 * @param tasks - List of tasks to filter
	 * @returns Array of overdue tasks
	 */
	getOverdueTasks(tasks: Task[]): Task[] {
		return tasks.filter((task) => task.isOverdue())
	}

	/**
	 * Private method to check for forbidden words
	 */
	private containsForbiddenWords(text: string): boolean {
		const forbiddenWords = ['offensive', 'inappropriate', 'rude']
		return forbiddenWords.some((word) => text.toLowerCase().includes(word))
	}
}
