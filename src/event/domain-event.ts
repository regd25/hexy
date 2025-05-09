/**
 * @description Domain event interface
 * A domain event is a record of something that happened in the domain.
 * It is used to trigger actions in the domain.
 * It is also used to record the history of the domain.
 * It is also used to trigger actions in the domain.
 * It is also used to record the history of the domain.
 * It is also used to trigger actions in the domain.
 * It is also used to record the history of the domain.
 */
export interface DomainEvent {
	readonly eventType: string
	readonly occurredOn: Date
	toPrimitive(): Record<string, any>
}
