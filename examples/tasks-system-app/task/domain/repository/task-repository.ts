import { Repository } from 'src/core/contracts'
import { Task, TaskId } from '../aggregate'

/**
 * Repository interface for Task entities in the domain layer
 * Extends the adapter to ensure compatibility with Repository interface
 */
export abstract class TaskRepository extends Repository<Task> {
	/**
	 * Find a task by its ID
	 * @param id - Task ID to search for
	 * @returns Task instance or null if not found
	 */
	abstract findById(id: TaskId): Promise<Task>

	/**
	 * Find all tasks
	 * @returns Array of all tasks
	 */
	abstract findAll(): Promise<Task[]>

	/**
	 * Find tasks by completed status
	 * @param completed - Status to filter by
	 * @returns Array of matching tasks
	 */
	abstract findByCompleted(completed: boolean): Promise<Task[]>

	/**
	 * Save a task
	 * @param task - Task to save
	 */
	abstract save(task: Task): Promise<void>

	/**
	 * Delete a task
	 * @param id - ID of task to delete
	 */
	abstract delete(id: TaskId): Promise<void>
}
