import { DataRecord } from '../types'
import { IdentifierValueObject, RoutingKeyValueObject } from '../value-objects'

export abstract class DomainEvent {
	/**
	 * @description The id of the aggregate that triggered the event
	 */
	abstract readonly aggregateId: IdentifierValueObject

	/**
	 * @description The routing key of the event
	 */
	abstract readonly routingKey: RoutingKeyValueObject

	/**
	 * @description The date and time the event occurred
	 */
	abstract readonly occurredOn: Date

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
	static fromPrimitives(data: DataRecord): DomainEvent {
		const event = Object.create(DomainEvent.prototype)
		return event.fromPrimitives(data)
	}
}
