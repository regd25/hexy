import type { DataRecord } from 'core/types'
import { Event } from 'core/di'
import type {
	StringValueObject,
	NumberIdValueObject,
	RoutingKeyValueObject,
} from 'core/aggregate'

/**
 * @description Abstract class for domain events
 */
@Event()
export abstract class DomainEvent {
	/**
	 * @description The id of the aggregate that triggered the event
	 */
	readonly aggregateId: StringValueObject | NumberIdValueObject

	/**
	 * @description The routing key of the event
	 */
	readonly routingKey: RoutingKeyValueObject

	/**
	 * @description The date and time the event occurred
	 */
	readonly occurredOn: Date

	/**
	 * @description Convert the event to a primitive object
	 */
	abstract toPrimitives(): DataRecord

	/**
	 * @description Get the name of the event
	 */
	abstract getEventName(): string

	constructor(
		aggregateId: StringValueObject | NumberIdValueObject,
		routingKey: RoutingKeyValueObject,
		occurredOn: Date = new Date(),
	) {
		this.aggregateId = aggregateId
		this.routingKey = routingKey
		this.occurredOn = occurredOn
	}

	/**
	 * @description Convert a primitive object to an event
	 */
	static fromPrimitives(data: DataRecord): DomainEvent {
		const event = Object.create(DomainEvent.prototype)
		return event.fromPrimitives(data)
	}
}
