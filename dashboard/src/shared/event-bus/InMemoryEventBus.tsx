import { EventBus, EventData } from '../types'

interface Subscription {
    handler: (data: EventData) => void
    context: any
}

export class InMemoryEventBus implements EventBus {
    private subscribers = new Map<string, Subscription[]>()
    private middleware: ((data: EventData) => EventData)[] = []

    subscribe(
        event: string,
        handler: (data: EventData) => void,
        context: any = null
    ) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, [])
        }

        const subscription: Subscription = { handler, context }
        this.subscribers.get(event)?.push(subscription)

        return () => this.unsubscribe(event, handler)
    }

    publish(event: string, data: any = null) {
        if (!this.subscribers.has(event)) {
            return
        }

        const subscriptions = this.subscribers.get(event)
        if (!subscriptions) {
            throw new Error(`No subscribers found for event ${event}`)
        }
        const eventData: EventData = { event, data, timestamp: Date.now() }

        const processedData = this.applyMiddleware(eventData)

        subscriptions.forEach(({ handler, context }) => {
            try {
                if (context) {
                    handler.call(context, processedData)
                } else {
                    handler(processedData)
                }
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error)
            }
        })
    }

    unsubscribe(event: string, handler: (data: EventData) => void) {
        if (!this.subscribers.has(event)) {
            return
        }

        const subscriptions = this.subscribers.get(event)
        if (!subscriptions) return
        const index = subscriptions?.findIndex(sub => sub.handler === handler)

        if (index !== -1) {
            subscriptions.splice(index, 1)
        }
    }

    addMiddleware(middleware: (data: EventData) => EventData) {
        this.middleware.push(middleware)
    }

    private applyMiddleware(eventData: EventData): EventData {
        return this.middleware.reduce((data, middleware) => {
            return middleware(data)
        }, eventData)
    }

    clear() {
        this.subscribers.clear()
    }
}
