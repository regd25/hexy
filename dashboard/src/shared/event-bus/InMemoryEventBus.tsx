import { EventBus, EventData } from './EventBus'

interface Subscription {
    handler: (data: EventData) => void
}

export class InMemoryEventBus implements EventBus {
    private subscribers = new Map<string, Subscription[]>()
    private middleware: ((data: EventData) => EventData)[] = []
    private readonly sourceId: string

    constructor(sourceId = 'in-memory') {
        this.sourceId = sourceId
    }

    subscribe<T = unknown>(event: string, handler: (data: EventData<T>) => void) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, [])
        }

        const subscription: Subscription = {
            handler: handler as unknown as (data: EventData) => void,
        }
        this.subscribers.get(event)?.push(subscription)

        return () => this.unsubscribe(event, handler as unknown as (data: EventData) => void)
    }

    publish(event: string, data: unknown) {
        const subscriptions = this.subscribers.get(event)
        if (!subscriptions || subscriptions.length === 0) {
            return
        }

        const eventData: EventData = {
            event,
            data,
            source: this.sourceId,
            timestamp: Date.now(),
        }
        const processedData = this.applyMiddleware(eventData)

        subscriptions.forEach(({ handler }) => {
            try {
                handler(processedData)
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error)
            }
        })
    }

    unsubscribe(event: string, handler: (data: EventData) => void) {
        const subscriptions = this.subscribers.get(event)
        if (!subscriptions) return
        const index = subscriptions.findIndex(sub => sub.handler === handler)

        if (index !== -1) {
            subscriptions.splice(index, 1)
        }
    }

    addMiddleware(middleware: (data: EventData) => EventData) {
        this.middleware.push(middleware)
    }

    private applyMiddleware(eventData: EventData): EventData {
        return this.middleware.reduce((data, middleware) => middleware(data), eventData)
    }

    clear() {
        this.subscribers.clear()
    }
}
