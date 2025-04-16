import type { DomainEvent } from 'core/event'

export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>
