/**
 * Data Transfer Object for updating an existing task
 */
export interface UpdateTaskDto {
	/**
	 * Title of the task
	 */
	title?: string

	/**
	 * Description of the task
	 */
	description?: string

	/**
	 * Due date for the task
	 */
	dueDate?: Date

	/**
	 * Priority level (1-5)
	 */
	priority?: number

	/**
	 * Completion status
	 */
	completed?: boolean
}
