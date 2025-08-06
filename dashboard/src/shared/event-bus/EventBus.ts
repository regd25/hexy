/**
 * EventBus interface for simplified architecture
 */
export interface EventBus {
    publish(event: string, data: any): void
    subscribe<T extends any = any>(
        event: string,
        handler: (event: EventData<T>) => void
    ): () => void
    addMiddleware(middleware: (event: EventData) => EventData): void
    clear(): void
}

export interface EventData<T = any> {
    event: string
    data: T
    timestamp: number
}
