import { DomainEvent } from '../dependency-injection'
import { DataRecord } from '../types'
import { IdentifierValueObject, RoutingKeyValueObject } from '../value-objects'

/**
 * @description Abstract class for domain events
 */
@DomainEvent()
export abstract class AbstractDomainEvent {
	/**
	 * @description The id of the aggregate that triggered the event
	 */
	readonly aggregateId: IdentifierValueObject

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
		aggregateId: IdentifierValueObject,
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
	static fromPrimitives(data: DataRecord): AbstractDomainEvent {
		const event = Object.create(AbstractDomainEvent.prototype)
		return event.fromPrimitives(data)
	}
}
