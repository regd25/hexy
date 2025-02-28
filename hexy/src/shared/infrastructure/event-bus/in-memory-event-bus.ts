import { EventBus } from '../../domain/event-bus/event-bus'
import { DomainEvent } from '../../domain/domain-event/domain-event'
import { Injectable } from 'src/shared/domain/dependency-injection'

/**
 * In-memory implementation of the EventBus.
 * This implementation is used for testing purposes.
 */
@Injectable()
export class InMemoryEventBus implements EventBus {
	private listeners: ((event: DomainEvent) => Promise<void>)[] = []

	/**
	 * Publishes one or more domain events.
	 * @param events The events to publish
	 */
	async publish(events: DomainEvent[]): Promise<void> {
		for (const event of events) {
			for (const listener of this.listeners) {
				await listener(event)
			}
		}
	}

	/**
	 * Adds a listener that will be called for each published event.
	 * @param listener The callback function to be called
	 */
	addListener(listener: (event: DomainEvent) => Promise<void>): void {
		this.listeners.push(listener)
	}
}
