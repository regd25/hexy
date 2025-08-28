export type DomainEvent<TName extends string = string, TPayload = unknown> = {
    name: TName
    payload: TPayload
    timestamp: number
    meta?: Record<string, unknown>
}

export type EventHandler<TEvent extends DomainEvent = DomainEvent> = (event: TEvent) => void | Promise<void>

export interface Subscription {
    unsubscribe(): void
}

export interface EventBus {
    publish<TEvent extends DomainEvent>(event: TEvent): Promise<void>
    subscribe<TEvent extends DomainEvent>(eventName: TEvent['name'], handler: EventHandler<TEvent>): Subscription
}
