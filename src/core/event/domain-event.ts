import type { DataRecord } from '../types'
import type { Identifier, RoutingKey } from '../aggregate/value-object'

/**
 * @description Abstract class for domain events
 */

export abstract class DomainEvent {
	/**
	 * @description The id of the aggregate that triggered the event
	 */
	readonly aggregateId: Identifier

	/**
	 * @description The routing key of the event
	 */
	readonly routingKey: RoutingKey

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

	/**
	 * @description Constructor for the domain event
	 * @param aggregateId - The id of the aggregate that triggered the event
	 * @param routingKey - The routing key of the event
	 * @param occurredOn - The date and time the event occurred
	 */
	constructor(
		aggregateId: Identifier,
		routingKey: RoutingKey,
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
