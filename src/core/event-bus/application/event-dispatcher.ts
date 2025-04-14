import type { EventBus, EventHandler } from 'shared/port'
import type { DomainEvent } from 'src/core/context'
import { Injectable } from 'src/core/di'

@Injectable()
export class EventDispatcher {
	constructor(private readonly eventBus: EventBus) {}

	async dispatch(event: DomainEvent): Promise<void> {
		await this.eventBus.publish([event])
	}

	async dispatchAll(events: DomainEvent[]): Promise<void> {
		await this.eventBus.publish(events)
	}

	async addListener(listener: EventHandler<DomainEvent>): Promise<void> {
		this.eventBus.addListener(listener)
	}
}
