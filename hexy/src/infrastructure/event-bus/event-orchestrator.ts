import { Event, EventBus, Injectable } from '../../domain'

export interface EventSubscriber<T extends Event> {
	subscribedTo(): string[]
	on(event: T): Promise<void>
}

@Injectable()
export class EventOrchestrator {
	private subscribers: Map<string, EventSubscriber<any>[]> = new Map()

	constructor(private readonly eventBus: EventBus) {
		this.setupEventBus()
	}

	private setupEventBus(): void {
		this.eventBus.addListener(async (event: Event) => {
			await this.dispatch(event)
		})
	}

	registerSubscriber(subscriber: EventSubscriber<any>): void {
		const subscribedEvents = subscriber.subscribedTo()

		subscribedEvents.forEach((eventName) => {
			if (!this.subscribers.has(eventName)) {
				this.subscribers.set(eventName, [])
			}

			this.subscribers.get(eventName)?.push(subscriber)
		})
	}

	async dispatch(event: Event): Promise<void> {
		const eventName = event.constructor.name
		const subscribers = this.subscribers.get(eventName) || []

		await Promise.all(subscribers.map((subscriber) => subscriber.on(event)))
	}
}
