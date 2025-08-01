import React, { createContext, useContext, useRef, useEffect } from 'react'

interface EventData {
    event: string
    data: any
    timestamp: number
}

interface Subscription {
    handler: (data: EventData) => void
    context: any
}

export class EventBus {
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
        this.subscribers.get(event)!.push(subscription)

        return () => this.unsubscribe(event, handler)
    }

    publish(event: string, data: any = null) {
        if (!this.subscribers.has(event)) {
            return
        }

        const subscriptions = this.subscribers.get(event)!
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

        const subscriptions = this.subscribers.get(event)!
        const index = subscriptions.findIndex(sub => sub.handler === handler)

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

const EventBusContext = createContext<EventBus | null>(null)

interface EventBusProviderProps {
    children: React.ReactNode
}

export const EventBusProvider: React.FC<EventBusProviderProps> = ({
    children,
}) => {
    const eventBusRef = useRef<EventBus | null>(null)

    if (!eventBusRef.current) {
        eventBusRef.current = new EventBus()
    }

    useEffect(() => {
        return () => {
            eventBusRef.current?.clear()
        }
    }, [])

    return (
        <EventBusContext.Provider value={eventBusRef.current}>
            {children}
        </EventBusContext.Provider>
    )
}

export const useEventBus = (): EventBus => {
    const context = useContext(EventBusContext)
    if (!context) {
        throw new Error('useEventBus must be used within EventBusProvider')
    }
    return context
}
