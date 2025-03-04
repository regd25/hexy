import { Criteria, EventBus, InfrastructureRepository } from 'hexy'
import { Task, TaskId } from '../../domain/aggregate/task'
import { TaskRepository } from '../../domain/aggregate/task-repository'
import { TaskAbstractRepository } from '../../domain/aggregate/adapters'

/**
 * In-memory implementation of TaskRepository
 * Used for testing and demonstration purposes
 */
@InfrastructureRepository()
export class InMemoryTaskRepository
	extends TaskAbstractRepository
	implements TaskRepository
{
	private tasks: Map<string, Task> = new Map()

	constructor(eventBus?: EventBus) {
		super(eventBus)
	}

	async findById(id: TaskId): Promise<Task | null> {
		const task = this.tasks.get(id.toString())
		return task || null
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
	 * Implementation of abstract method from AbstractRepository
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

	/**
	 * Clear all tasks from the repository
	 * Utility method for testing
	 */
	clear(): void {
		this.tasks.clear()
	}
}
