import { Event, RoutingKeyValueObject, DataRecord } from 'hexy'
import { TaskId, TaskTitle, TaskDescription } from './value-objects'

export class TaskEvent extends Event {
	constructor(
		public readonly id: TaskId,
		public readonly title: TaskTitle,
		public readonly description: TaskDescription,
		public readonly completed: boolean = false,
		public readonly createdAt: Date = new Date(),
	) {
		super(id, new RoutingKeyValueObject('task'), new Date())
	}

	static fromPrimitives(data: DataRecord): TaskEvent {
		return new TaskEvent(
			new TaskId(data.id as string),
			new TaskTitle(data.title as string),
			new TaskDescription(data.description as string),
		)
	}

	toPrimitives(): DataRecord {
		return {
			id: this.id.toString(),
			title: this.title.toPrimitive(),
			description: this.description.toPrimitive(),
			completed: this.completed,
			createdAt: this.createdAt.toISOString(),
		}
	}

	getEventName(): string {
		return 'task.created'
	}
}
