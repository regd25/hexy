import { ApplicationService, Inject } from 'hexy'
import {
	TaskDomainService,
	Task,
	InvalidTaskDataError,
	TaskRepository,
	TaskId,
} from '../domain'
import { TASK_REPOSITORY } from '../infrastructure/task-infrastructure-module'

/**
 * Application service for Task entities.
 * Handles use cases and orchestrates domain logic.
 */
@ApplicationService()
export class TaskApplicationService {
	constructor(
		@Inject(TASK_REPOSITORY) private readonly taskRepository: TaskRepository,
		private readonly taskDomainService: TaskDomainService,
	) {}

	/**
	 * Create a new task
	 * @param title - Title of the task
	 * @param description - Description of the task
	 * @returns Created task
	 */
	async createTask(title: string, description: string): Promise<Task> {
		const task = Task.create(title, description)

		// Validate the task using domain service
		if (!this.taskDomainService.validate(task)) {
			throw new InvalidTaskDataError()
		}

		// Save and return the task
		await this.taskRepository.save(task)
		return task
	}

	/**
	 * Complete a task
	 * @param id - ID of the task to complete
	 */
	async completeTask(id: string): Promise<void> {
		const task = await this.taskRepository.findById(new TaskId(id))
		task.complete()
		await this.taskRepository.save(task)
	}

	/**
	 * Get all tasks
	 * @returns List of all tasks
	 */
	async getAllTasks(): Promise<Task[]> {
		return this.taskRepository.findAll()
	}

	/**
	 * Get high priority tasks
	 * @returns List of high priority tasks
	 */
	async getHighPriorityTasks(): Promise<Task[]> {
		const allTasks = await this.taskRepository.findAll()
		return allTasks.filter((task) =>
			this.taskDomainService.isHighPriority(task),
		)
	}

	/**
	 * Delete a task
	 * @param id - ID of the task to delete
	 */
	async deleteTask(id: string): Promise<void> {
		await this.taskRepository.delete(new TaskId(id))
	}

	/**
	 * Get a task by ID
	 * @param id - ID of the task to retrieve
	 * @returns Task if found, otherwise undefined
	 */
	async getTaskById(id: string): Promise<Task> {
		return this.taskRepository.findById(new TaskId(id))
	}
}
