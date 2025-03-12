import { Injectable } from '../dependency-injection'
import { Event } from '../event/event'
import { EventHandler } from './event-handler'

/**
 * Interface for event bus implementations.
 * The event bus is responsible for publishing domain events.
 */
@Injectable()
export abstract class EventBus {
	/**
	 * Publishes one or more domain events.
	 * @param events The events to publish
	 */
	abstract publish(events: Event[]): Promise<void>

	/**
	 * Adds a listener that will be called for each published event.
	 * @param listener The callback function to be called
	 */
	abstract addListener<T extends Event>(listener: EventHandler<T>): void
}
