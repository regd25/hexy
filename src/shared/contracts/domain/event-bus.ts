import { Injectable } from 'shared/di'
import { DomainEvent } from 'shared/core'
import type { EventHandler } from './event-handler'

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
	abstract publish(events: DomainEvent[]): Promise<void>

	/**
	 * Adds a listener that will be called for each published event.
	 * @param listener The callback function to be called
	 */
	abstract addListener<T extends DomainEvent>(listener: EventHandler<T>): void
}
