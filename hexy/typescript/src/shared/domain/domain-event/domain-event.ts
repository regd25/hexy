import { DataRecord } from '../types'
import { IdentifierValueObject, RoutingKeyValueObject } from '../value-objects'

export abstract class DomainEvent {
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

	constructor(aggregateId: IdentifierValueObject, routingKey: RoutingKeyValueObject, occurredOn: Date) {
		this.aggregateId = aggregateId
		this.routingKey = routingKey
		this.occurredOn = occurredOn
	}

	/**
	 * @description Convert the event to a primitive object
	 */
	abstract toPrimitives(): DataRecord

	/**
	 * @description Get the name of the event
	 */
	abstract getEventName(): string

	/**
	 * @description Convert a primitive object to an event
	 */
	abstract fromPrimitives(data: DataRecord): DomainEvent
}
