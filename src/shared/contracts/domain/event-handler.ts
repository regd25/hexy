import type { DomainEvent } from 'shared/core'

export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>
