import type { DomainEvent } from '../event'
import { Port, PORT_TYPES } from '../decorators/port.decorator'

/**
 * Type definition for event handler functions.
 * An event handler processes a specific domain event.
 */
export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>


/**
 * Interface for event bus implementations.
 * Defines methods to publish events and add listeners.
 */
@Port({
	context: 'Core',
	description: 'Port for publishing and subscribing to domain events',
	type: PORT_TYPES.EVENT_BUS,
})
export abstract class EventBus {
	/**
	 * Publishes one or more domain events to the bus.
	 * @param events An array of domain events to publish.
	 */
	abstract publish(events: DomainEvent[]): Promise<void>

	/**
	 * Adds an event listener (handler) to the bus.
	 * The listener will be invoked when matching events are published.
	 * @param listener The event handler function.
	 */
	abstract addListener<T extends DomainEvent>(listener: EventHandler<T>): void
}
