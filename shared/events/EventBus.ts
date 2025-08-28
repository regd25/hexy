/**
 * EventBus - Single Source of Truth for events
 * Base types and interface, each system makes its transformation
 */

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
    publish<T extends DomainEvent>(event: T): void
    subscribe<T extends DomainEvent>(eventName: T['name'], handler: EventHandler<T>): Subscription
    addMiddleware(middleware: (event: DomainEvent) => DomainEvent): void
    clear(): void
}
