import type { DomainEvent } from 'src/core/context'

export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>
