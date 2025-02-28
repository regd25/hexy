import { DomainEvent } from '../../domain/domain-event/domain-event'
import { EventBus } from '../../domain/event-bus/event-bus'
import { Injectable } from '../../domain/dependency-injection'
import { EventBusError } from './event-bus-error'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import {
	SQSClient,
	ReceiveMessageCommand,
	DeleteMessageCommand,
} from '@aws-sdk/client-sqs'

export interface AWSSNSSQSConfig {
	region: string
	topicArn: string // Pre-configured topic ARN
	queueUrl?: string // Optional: only needed for consuming events
	credentials?: {
		accessKeyId: string
		secretAccessKey: string
	}
	endpoint?: string // For localstack in development
}

/**
 * Stateless AWS SNS/SQS implementation of the EventBus.
 * This implementation publishes events to a pre-configured SNS topic.
 * It's suitable for serverless environments like AWS Lambda.
 */
@Injectable()
export class AWSSNSSQSEventBus implements EventBus {
	private snsClient: SNSClient
	private sqsClient: SQSClient | null = null
	private listeners: Array<(event: DomainEvent) => Promise<void>> = []

	constructor(private readonly config: AWSSNSSQSConfig) {
		const clientConfig = {
			region: config.region,
			credentials: config.credentials,
			endpoint: config.endpoint,
		}

		this.snsClient = new SNSClient(clientConfig)

		// Only create SQS client if queue URL is provided
		if (config.queueUrl) {
			this.sqsClient = new SQSClient(clientConfig)
		}
	}

	/**
	 * Publishes domain events to the SNS topic.
	 * @param events The events to publish
	 */
	async publish(events: DomainEvent[]): Promise<void> {
		if (!this.config.topicArn) {
			throw new EventBusError('AWS SNS topic ARN not provided')
		}

		const publishPromises = events.map(async (event) => {
			const eventClassName = event.constructor.name
			const content = JSON.stringify(event)

			await this.snsClient.send(
				new PublishCommand({
					TopicArn: this.config.topicArn,
					Message: content,
					MessageAttributes: {
						eventClassName: {
							DataType: 'String',
							StringValue: eventClassName,
						},
					},
				}),
			)
		})

		await Promise.all(publishPromises)

		// Also notify local listeners
		const localPromises = events.flatMap((event) =>
			this.listeners.map((listener) => listener(event)),
		)

		await Promise.all(localPromises)
	}

	/**
	 * Adds a listener that will be called for each published event.
	 * @param listener The callback function to be called
	 */
	addListener(listener: (event: DomainEvent) => Promise<void>): void {
		this.listeners.push(listener)
	}

	/**
	 * Polls for messages from the SQS queue once.
	 * This method is designed to be called from a Lambda function triggered by SQS.
	 * @param maxMessages Maximum number of messages to receive
	 * @returns The number of messages processed
	 */
	async pollMessages(maxMessages: number = 10): Promise<number> {
		if (!this.sqsClient || !this.config.queueUrl) {
			throw new EventBusError('SQS client or queue URL not configured')
		}

		try {
			const response = await this.sqsClient.send(
				new ReceiveMessageCommand({
					QueueUrl: this.config.queueUrl,
					MaxNumberOfMessages: maxMessages,
					WaitTimeSeconds: 0, // Don't wait in serverless environments
					MessageAttributeNames: ['All'],
				}),
			)

			if (!response.Messages || response.Messages.length === 0) {
				return 0
			}

			let processedCount = 0

			for (const message of response.Messages) {
				try {
					// Parse the SNS message from the SQS message body
					const snsMessage = JSON.parse(message.Body || '{}')
					const eventData = JSON.parse(snsMessage.Message || '{}')
					const eventClassName =
						snsMessage.MessageAttributes?.eventClassName?.Value ||
						message.MessageAttributes?.eventClassName?.StringValue

					if (eventClassName && eventData) {
						// Create an instance of the event
						const event = this.deserializeEvent(eventClassName, eventData)

						// Notify all listeners
						for (const listener of this.listeners) {
							await listener(event)
						}

						processedCount++
					}

					// Delete the message from the queue
					if (message.ReceiptHandle) {
						await this.sqsClient.send(
							new DeleteMessageCommand({
								QueueUrl: this.config.queueUrl,
								ReceiptHandle: message.ReceiptHandle,
							}),
						)
					}
				} catch (error) {
					console.error('Error processing SQS message:', error)
				}
			}

			return processedCount
		} catch (error) {
			console.error('Error polling SQS queue:', error)
			throw new EventBusError(`Failed to poll SQS queue: ${error}`)
		}
	}

	/**
	 * Processes an SQS event from a Lambda function.
	 * @param sqsEvent The SQS event from Lambda
	 * @returns The number of messages processed
	 */
	async processSQSEvent(sqsEvent: any): Promise<number> {
		if (!sqsEvent.Records || !Array.isArray(sqsEvent.Records)) {
			return 0
		}

		let processedCount = 0

		for (const record of sqsEvent.Records) {
			try {
				// Parse the SNS message from the SQS message body
				const body = record.body || '{}'
				const snsMessage = JSON.parse(body)
				const eventData = JSON.parse(snsMessage.Message || '{}')
				const eventClassName =
					snsMessage.MessageAttributes?.eventClassName?.Value ||
					record.messageAttributes?.eventClassName?.stringValue

				if (eventClassName && eventData) {
					// Create an instance of the event
					const event = this.deserializeEvent(eventClassName, eventData)

					// Notify all listeners
					for (const listener of this.listeners) {
						await listener(event)
					}

					processedCount++
				}
			} catch (error) {
				console.error('Error processing SQS event record:', error)
				// In Lambda, throwing an error will cause the message to be retried
				throw error
			}
		}

		return processedCount
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
