import { EventBusError } from './event-bus-error'
import Redis from 'ioredis'
import { EventBus, type EventHandler } from '@/port'
import { Injectable } from '@/di'
import { DomainEvent } from '@/event'

export interface RedisConfig {
	host: string
	port: number
	password?: string
	db?: number
	keyPrefix?: string
	tls?: boolean
	channelName: string // Pre-configured channel name
}

/**
 * Stateless Redis implementation of the EventBus.
 * This implementation uses Redis Pub/Sub for event distribution.
 * It's suitable for serverless environments with a pre-configured channel.
 */
@Injectable()
export class RedisEventBus implements EventBus {
	private redis: Redis
	private listeners: Array<EventHandler<any>> = []

	constructor(private readonly config: RedisConfig) {
		this.redis = new Redis({
			host: config.host,
			port: config.port,
			password: config.password,
			db: config.db,
			keyPrefix: config.keyPrefix,
			tls: config.tls ? {} : undefined,
		})
	}

	/**
	 * Publishes domain events to the Redis channel.
	 * @param events The events to publish
	 */
	async publish(events: DomainEvent[]): Promise<void> {
		const publishPromises = events.map(async (event) => {
			const eventClassName = event.constructor.name
			const message = JSON.stringify({
				eventClassName,
				data: event,
			})

			await this.redis.publish(this.config.channelName, message)
		})

		await Promise.all(publishPromises)

		// Also notify local listeners
		const localPromises = events.flatMap((event) =>
			this.listeners.map((listener) => listener(event)),
		)

		await Promise.all(localPromises)

		// Close Redis connection after publishing
		await this.redis.quit()
	}

	/**
	 * Adds a listener that will be called for each published event.
	 * @param listener The callback function to be called
	 */
	addListener<T extends DomainEvent>(listener: EventHandler<T>): void {
		this.listeners.push(listener)
	}

	/**
	 * Processes a message from Redis.
	 * This method is designed to be called from a serverless function.
	 * @param message The message from Redis
	 */
	async processMessage(message: string): Promise<void> {
		try {
			const { eventClassName, data } = JSON.parse(message)

			if (eventClassName && data) {
				// Create an instance of the event
				const event = this.deserializeEvent(eventClassName, data)

				// Notify all listeners
				for (const listener of this.listeners) {
					await listener(event)
				}
			}
		} catch (error) {
			console.error('Error processing Redis message:', error)
			throw new EventBusError(`Failed to process Redis message: ${error}`)
		}
	}

	/**
	 * Deserializes an event from JSON.
	 * @param className The name of the event class
	 * @param data The event data in JSON format
	 * @returns A properly instantiated domain event
	 */
	private deserializeEvent(className: string, data: any): DomainEvent {
		return DomainEvent.fromPrimitives({
			...data,
			eventName: className,
		})
	}
}
