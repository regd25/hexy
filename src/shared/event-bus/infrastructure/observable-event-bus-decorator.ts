import { EventBus, type EventHandler } from 'shared/contracts'
import type { DomainEvent } from 'shared/core'
import { Injectable } from 'shared/di'
import type { Telemetry } from 'shared/telemetry'

/**
 * Decorator for EventBus that adds observability.
 * This implementation wraps another EventBus and adds telemetry.
 */
@Injectable()
export class ObservableEventBusDecorator implements EventBus {
	constructor(
		private readonly eventBus: EventBus,
		private readonly telemetry: Telemetry,
	) {}

	async publish(events: DomainEvent[]): Promise<void> {
		this.telemetry.startSpan('event_bus.publish')

		try {
			// Record metrics
			this.telemetry.recordMetric('event_bus.events_published', events.length)

			// Group events by type for better metrics
			const eventTypes = events.reduce(
				(acc, event) => {
					const type = event.constructor.name
					acc[type] = (acc[type] || 0) + 1
					return acc
				},
				{} as Record<string, number>,
			)

			// Record metrics for each event type
			Object.entries(eventTypes).forEach(([type, count]) => {
				this.telemetry.recordMetric(`event_bus.events_by_type`, count, {
					event_type: type,
				})
			})

			// Publish events
			await this.eventBus.publish(events)
		} catch (error) {
			// Record error
			this.telemetry.recordError(error as Error, { component: 'event_bus' })
			throw error
		}
	}

	addListener<T extends DomainEvent>(listener: EventHandler<T>): void {
		this.eventBus.addListener(listener)
	}
}
