import { DomainEvent } from '../dependency-injection'
import { DataRecord } from '../types'
import { RoutingKeyValueObject, StringValueObject, NumberIdValueObject } from '../value-objects'

/**
 * @description Abstract class for domain events
 */
@DomainEvent()
export abstract class Event {
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
	static fromPrimitives(data: DataRecord): Event {
		const event = Object.create(Event.prototype)
		return event.fromPrimitives(data)
	}
}
