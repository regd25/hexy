import type { EventBus, EventHandler } from 'shared/contracts'
import type { DomainEvent } from 'shared/core'
import { Injectable } from 'shared/di'

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
