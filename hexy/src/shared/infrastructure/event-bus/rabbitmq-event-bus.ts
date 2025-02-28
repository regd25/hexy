import { DomainEvent } from '../../domain/domain-event/domain-event'
import { EventBus } from '../../domain/event-bus/event-bus'
import { Injectable } from '../../domain/dependency-injection'
import * as amqp from 'amqplib'
import { EventBusError } from './event-bus-error'

export interface RabbitMQConfig {
	url: string
	exchange: string
}

/**
 * RabbitMQ implementation of the EventBus.
 * This implementation publishes events to a RabbitMQ exchange.
 * It's suitable for production environments and distributed systems.
 */
@Injectable()
export class RabbitMQEventBus implements EventBus {
	private connection: amqp.Connection | null = null
	private channel: amqp.Channel | null = null
	private listeners: Array<(event: DomainEvent) => Promise<void>> = []
	private connected = false
	private connecting = false
	private readonly queueName: string

	constructor(private readonly config: RabbitMQConfig) {
		this.queueName = `event-bus-${this.generateRandomString(8)}`
	}

	/**
	 * Connects to RabbitMQ if not already connected.
	 */
	private async connect(): Promise<void> {
		if (this.connected || this.connecting) {
			return
		}

		this.connecting = true

		try {
			// Connect to RabbitMQ
			this.connection = await amqp.connect(this.config.url)

			// Create a channel
			this.channel = await this.connection.createChannel()

			// Declare the exchange
			await this.channel.assertExchange(this.config.exchange, 'topic', {
				durable: true,
			})

			// Create a queue for this instance
			await this.channel.assertQueue(this.queueName, { exclusive: true })

			// Bind the queue to the exchange with a wildcard routing key
			await this.channel.bindQueue(this.queueName, this.config.exchange, '#')

			// Set up a consumer to receive messages
			await this.channel.consume(
				this.queueName,
				async (msg: amqp.Message | null) => {
					if (!msg) return

					try {
						const content = JSON.parse(msg.content.toString())
						const eventClassName = msg.properties?.headers?.eventClassName

						// Create an instance of the event
						const event = this.deserializeEvent(eventClassName, content)

						// Notify all listeners
						for (const listener of this.listeners) {
							await listener(event)
						}

						// Acknowledge the message
						this.channel?.ack(msg)
					} catch (error) {
						console.error('Error processing event:', error)
						// Reject the message and requeue it
						this.channel?.nack(msg, false, true)
					}
				},
			)

			this.connected = true
		} catch (error) {
			console.error('Error connecting to RabbitMQ:', error)
			throw error
		} finally {
			this.connecting = false
		}
	}

	/**
	 * Publishes domain events to the RabbitMQ exchange.
	 * @param events The events to publish
	 */
	async publish(events: DomainEvent[]): Promise<void> {
		await this.connect()

		if (!this.channel) {
			throw new EventBusError('RabbitMQ channel not available')
		}

		for (const event of events) {
			const eventClassName = event.constructor.name
			const routingKey = eventClassName
			const content = JSON.stringify(event)

			this.channel.publish(
				this.config.exchange,
				routingKey,
				Buffer.from(content),
				{
					headers: {
						eventClassName,
					},
				},
			)
		}

		// Also notify local listeners
		const promises = events.flatMap((event) =>
			this.listeners.map((listener) => listener(event)),
		)

		await Promise.all(promises)
	}

	/**
	 * Adds a listener that will be called for each published event.
	 * @param listener The callback function to be called
	 */
	addListener(listener: (event: DomainEvent) => Promise<void>): void {
		this.listeners.push(listener)
	}

	/**
	 * Closes the connection to RabbitMQ.
	 */
	async close(): Promise<void> {
		if (this.channel) {
			await this.channel.close()
			this.channel = null
		}

		if (this.connection) {
			await this.connection.close()
			this.connection = null
		}

		this.connected = false
	}

	/**
	 * Deserializes an event from JSON.
	 * This implementation recreates the proper event instance based on the class name.
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

	/**
	 * Generates a random string of the specified length.
	 */
	private generateRandomString(length: number): string {
		const characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		let result = ''

		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length))
		}

		return result
	}
}
