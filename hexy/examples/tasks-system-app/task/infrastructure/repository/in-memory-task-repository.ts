import { Criteria, EventBus, InfrastructureRepository, Repository } from 'hexy'
import { TaskRepository, TaskId, Task, TaskNotFoundError } from '../../domain'

/**
 * In-memory implementation of TaskRepository
 * Used for testing and demonstration purposes
 */
@InfrastructureRepository()
export class InMemoryTaskRepository
	extends Repository<Task>
	implements TaskRepository
{
	private tasks: Map<string, Task> = new Map()

	constructor(eventBus?: EventBus) {
		super(eventBus)
	}

	async findById(id: TaskId): Promise<Task> {
		const task = this.tasks.get(id.toString())
		if (!task) {
			throw new TaskNotFoundError(id)
		}
		return task
	}

	async findAll(): Promise<Task[]> {
		return Array.from(this.tasks.values())
	}

	async findByCompleted(completed: boolean): Promise<Task[]> {
		return Array.from(this.tasks.values()).filter(
			(task) => task.completed === completed,
		)
	}

	async delete(id: TaskId): Promise<void> {
		this.tasks.delete(id.toString())
	}

	/**
	 * Implementation of abstract method from Repository
	 */
	protected async persist(task: Task): Promise<void> {
		this.tasks.set(task.id.toString(), task)
	}

	/**
	 * Implementation of matching method from Repository interface
	 */
	async matching(criteria: Criteria): Promise<Task[]> {
		// Simple implementation that filters by criteria
		// In a real implementation, this would convert criteria to filters
		return this.findAll()
	}

	/**
	 * Implementation of count method from Repository interface
	 */
	async count(criteria?: Criteria): Promise<number> {
		if (criteria) {
			const results = await this.matching(criteria)
			return results.length
		}
		return this.tasks.size
	}
	exists(id: TaskId): Promise<boolean> {
		return Promise.resolve(this.tasks.has(id.toString()))
	}

	/**
	 * Clear all tasks from the repository
	 * Utility method for testing
	 */
	clear(): void {
		this.tasks.clear()
	}
}
