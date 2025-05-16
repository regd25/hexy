import { EventBusError } from './event-bus-error'
import Redis from 'ioredis'
import { Injectable } from '@/infrastructure/di'
import { DomainEvent, EventBus, EventHandler } from '@/domain/event'

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
}
