/**
 * InMemoryEventBus - Simple implementation of EventBus
 * Single source of truth for events
 */

import { DomainEvent, EventBus, EventHandler, Subscription } from './EventBus'

/**
 * Simple in-memory EventBus implementation
 */
export class InMemoryEventBus implements EventBus {
    private subscribers = new Map<string, Set<EventHandler>>()
    private middlewares: Array<(event: DomainEvent) => DomainEvent> = []

    publish<T extends DomainEvent>(event: T): void {
        for (const middleware of this.middlewares) {
            event = middleware(event) as T
        }

        const subscribers = this.subscribers.get(event.name)
        if (subscribers) {
            subscribers.forEach(handler => {
                try {
                    handler(event)
                } catch (error) {
                    console.error('Error in event handler:', error)
                }
            })
        }
    }

    subscribe<T extends DomainEvent>(eventName: string, handler: EventHandler<T>): Subscription {
        if (!this.subscribers.has(eventName)) {
            this.subscribers.set(eventName, new Set())
        }

        const subscribers = this.subscribers.get(eventName)
        subscribers?.add(handler as EventHandler)

        return {
            unsubscribe: () => {
                subscribers?.delete(handler as EventHandler)
                if (subscribers && subscribers.size === 0) {
                    this.subscribers.delete(eventName)
                }
            },
        }
    }

    addMiddleware(middleware: (event: DomainEvent) => DomainEvent): void {
        this.middlewares.push(middleware)
    }

    clear(): void {
        this.subscribers.clear()
        this.middlewares.length = 0
    }
}

/**
 * Factory function
 */
export const createEventBus = (): EventBus => {
    return new InMemoryEventBus()
}

/**
 * Global singleton (opcional)
 */
let globalEventBus: EventBus | null = null

export const getGlobalEventBus = (): EventBus => {
    if (!globalEventBus) {
        globalEventBus = createEventBus()
    }
    return globalEventBus
}

export const resetGlobalEventBus = (): void => {
    globalEventBus = null
}
