import React, { createContext, useRef, useEffect } from 'react'
import { EventBus } from './EventBus'
import { InMemoryEventBus } from './InMemoryEventBus'

export const EventBusContext = createContext<EventBus | null>(null)

interface EventBusProviderProps {
    children: React.ReactNode
    eventBus?: EventBus
}

export const EventBusProvider: React.FC<EventBusProviderProps> = ({
    children,
    eventBus,
}) => {
    const eventBusRef = useRef<EventBus | null>(null)

    if (!eventBusRef.current && eventBus) {
        eventBusRef.current = eventBus
    } else if (!eventBusRef.current) {
        eventBusRef.current = new InMemoryEventBus()
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
