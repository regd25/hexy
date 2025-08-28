import { DomainEvent, EventBus, EventHandler, Subscription } from './EventBus'

export class InMemoryEventBus implements EventBus {
    private readonly handlers: Map<string, Set<EventHandler>> = new Map()

    async publish<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
        const set = this.handlers.get(event.name)
        if (!set) return
        const handlers = Array.from(set)
        for (const handler of handlers) {
            await Promise.resolve(handler(event))
        }
    }

    subscribe<TEvent extends DomainEvent>(eventName: TEvent['name'], handler: EventHandler<TEvent>): Subscription {
        const set = this.handlers.get(eventName) ?? new Set<EventHandler>()
        set.add(handler as EventHandler)
        this.handlers.set(eventName, set)
        return {
            unsubscribe: () => {
                const current = this.handlers.get(eventName)
                if (!current) return
                current.delete(handler as EventHandler)
                if (current.size === 0) this.handlers.delete(eventName)
            },
        }
    }
}
