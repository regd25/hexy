import { EventBus } from 'shared/contracts'
import { InMemoryEventBus } from './in-memory-event-bus'
import { AWSSNSSQSEventBus } from './aws-event-bus'
import { RedisEventBus } from './redis-event-bus'
import { Injectable } from 'shared/di'

export type EventBusConfig = {
	type: 'in-memory' | 'aws-sns-sqs' | 'redis'
	aws?: {
		region: string
		topicArn: string
		queueUrl?: string
		credentials?: {
			accessKeyId: string
			secretAccessKey: string
		}
		endpoint?: string
	}
	redis?: {
		host: string
		port: number
		password?: string
		db?: number
		keyPrefix?: string
		tls?: boolean
		channelName: string
	}
}

/**
 * Factory for creating EventBus instances based on configuration.
 * This version is designed for serverless environments.
 */
@Injectable()
export class EventBusFactory {
	/**
	 * Creates an EventBus instance based on the provided configuration.
	 */
	create(config: EventBusConfig): EventBus {
		switch (config.type) {
			case 'aws-sns-sqs':
				if (!config.aws) {
					throw new Error('AWS configuration is required for aws-sns-sqs event bus')
				}
				return new AWSSNSSQSEventBus(config.aws)

			case 'redis':
				if (!config.redis) {
					throw new Error('Redis configuration is required for redis event bus')
				}
				return new RedisEventBus(config.redis)

			case 'in-memory':
			default:
				return new InMemoryEventBus()
		}
	}
}
