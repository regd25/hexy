/**
 * Data Transfer Object for creating a new task
 */
export interface CreateTaskDto {
	/**
	 * Title of the task
	 */
	title: string

	/**
	 * Description of the task
	 */
	description: string

	/**
	 * Due date for the task
	 */
	dueDate?: Date

	/**
	 * Priority level (1-5)
	 */
	priority?: number
}
