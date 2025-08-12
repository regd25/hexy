/**
 * EventBus interface for simplified architecture
 */
export interface EventBus {
    publish(event: string, data: unknown): void
    subscribe<T = unknown>(
        event: string,
        handler: (event: EventData<T>) => void
    ): () => void
    addMiddleware(middleware: (event: EventData) => EventData): void
    clear(): void
}

export interface EventData<T = unknown> {
    event: string
    source: string
    data: T
    timestamp: number
}
