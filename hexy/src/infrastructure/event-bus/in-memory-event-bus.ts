import { Event, EventBus, EventHandler, Injectable } from '@/domain'

/**
 * In-memory implementation of the EventBus.
 * This implementation is used for testing purposes.
 */
@Injectable()
export class InMemoryEventBus implements EventBus {
	private listeners: EventHandler<any>[] = []

	/**
	 * Publishes one or more domain events.
	 * @param events The events to publish
	 */
	async publish(events: Event[]): Promise<void> {
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
	addListener<T extends Event>(listener: EventHandler<T>): void {
		this.listeners.push(listener)
	}
}
