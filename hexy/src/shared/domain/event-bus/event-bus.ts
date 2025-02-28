import { DomainEvent } from '../domain-event/domain-event'

/**
 * Interface for event bus implementations.
 * The event bus is responsible for publishing domain events.
 */
export interface EventBus {
	/**
	 * Publishes one or more domain events.
	 * @param events The events to publish
	 */
	publish(events: DomainEvent[]): Promise<void>

	/**
	 * Adds a listener that will be called for each published event.
	 * @param listener The callback function to be called
	 */
	addListener(listener: (event: DomainEvent) => Promise<void>): void
}
