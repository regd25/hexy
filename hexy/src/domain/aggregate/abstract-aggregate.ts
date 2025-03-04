import { DomainAggregate } from '../dependency-injection'
import { AbstractDomainEvent } from '../domain-event/abstract-domain-event'
import { DataRecord } from '../types'
import { IdentifierValueObject } from '../value-objects'

/**
 * @description Abstract class for aggregate roots
 */
@DomainAggregate()
export abstract class AbstractAggregate {
	/**
	 * @description The id of the aggregate root
	 */
	abstract id: IdentifierValueObject

	/**
	 * @description The events of the aggregate root
	 */
	private events: AbstractDomainEvent[] = []

	private version: number = 0

	getEvents(): AbstractDomainEvent[] {
		return this.events
	}

	getVersion(): number {
		return this.version
	}

	incrementVersion(): void {
		this.version++
	}

	protected clearEvents(): void {
		this.events = []
	}

	protected hasEvents(): boolean {
		return this.events.length > 0
	}

	protected apply(event: AbstractDomainEvent): void {
		this.events.push(event)
	}

	protected applyEvents(events: AbstractDomainEvent[]): void {
		events.forEach((event) => this.apply(event))
	}

	abstract toPrimitives(): DataRecord

	static fromPrimitives(primitives: DataRecord): AbstractAggregate {
		throw new Error('Not implemented')
	}
}
