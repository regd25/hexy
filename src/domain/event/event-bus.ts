import type { DomainEvent } from '@/event/domain-event'

/**
 * @description Base event bus interface
 */
export interface EventBus {
	publish(events: DomainEvent[]): Promise<void>
	addListener<T extends DomainEvent>(listener: EventHandler<T>): void
}

export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>
