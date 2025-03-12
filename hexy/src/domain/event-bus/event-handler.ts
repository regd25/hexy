import { Event } from '../event/event'

export type EventHandler<T extends Event> = (event: T) => Promise<void>
