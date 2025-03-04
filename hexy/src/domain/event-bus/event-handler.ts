import { AbstractDomainEvent } from '../domain-event/abstract-domain-event'

export type EventHandler<T extends AbstractDomainEvent> = (
	event: T,
) => Promise<void>
