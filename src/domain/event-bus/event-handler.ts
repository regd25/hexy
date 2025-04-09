import { Event } from './event'

export type EventHandler<T extends Event> = (event: T) => Promise<void>
