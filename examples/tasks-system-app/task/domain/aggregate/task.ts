import { v4 as uuidv4 } from 'uuid'
import { TaskEvent } from './task-event'
import { TaskId, TaskTitle, TaskDescription } from './value-objects'
import { AggregateRoot } from 'src/core/context'
import type { DataRecord } from 'src/core/types'

export class Task extends AggregateRoot {
	constructor(
		public readonly id: TaskId,
		public readonly title: TaskTitle,
		public readonly description: TaskDescription,
		public readonly completed: boolean = false,
		public readonly createdAt: Date = new Date(),
	) {
		super()
	}

	// Domain logic
	isOverdue(now: Date = new Date()): boolean {
		const oneWeek = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
		return !this.completed && now.getTime() - this.createdAt.getTime() > oneWeek
	}

	complete(): Task {
		if (this.completed) {
			return this
		}

		const completedTask = new Task(
			this.id,
			this.title,
			this.description,
			true,
			this.createdAt,
		)
		completedTask.record(TaskEvent.fromPrimitives(completedTask.toPrimitives()))

		return completedTask
	}

	// Event management
	record(event: TaskEvent): void {
		this.apply(event)
	}

	getEvents(): TaskEvent[] {
		return this.getEvents() as TaskEvent[]
	}

	clearEvents(): void {
		this.clearEvents()
	}

	// Static factory methods
	static create(
		id: string,
		title: string,
		description: string = '',
		completed: boolean = false,
	): Task {
		const task = new Task(
			new TaskId(id || uuidv4()),
			new TaskTitle(title),
			new TaskDescription(description),
			completed,
		)

		task.record(TaskEvent.fromPrimitives(task.toPrimitives()))

		return task
	}

	// Serialization methods
	toPrimitives(): DataRecord {
		return {
			id: this.id.toString(),
			title: this.title.toPrimitive(),
			description: this.description.toPrimitive(),
			completed: this.completed,
			createdAt: this.createdAt.toISOString(),
		}
	}

	static fromPrimitives(primitives: DataRecord): Task {
		return new Task(
			new TaskId(primitives['id'] as string),
			new TaskTitle(primitives['title'] as string),
			new TaskDescription(primitives['description'] as string),
			primitives['completed'] as boolean,
			new Date(primitives['createdAt'] as string),
		)
	}
}
