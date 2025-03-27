import { DomainAggregate } from '../dependency-injection'
import { Event } from '../event/event'
import { DataRecord } from '../types'
import { IdentifierValueObject } from '../value-objects'

/**
 * @description Abstract class for aggregate roots
 */
@DomainAggregate()
export abstract class Aggregate {
	/**
	 * @description The id of the aggregate root
	 */
	abstract id: IdentifierValueObject

	/**
	 * @description The events of the aggregate root
	 */
	private events: Event[] = []

	private version: number = 0

	getEvents(): Event[] {
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

	protected apply(event: Event): void {
		this.events.push(event)
	}

	protected applyEvents(events: Event[]): void {
		events.forEach((event) => this.apply(event))
	}

	abstract toPrimitives(): DataRecord

	static fromPrimitives(primitives: DataRecord): Aggregate {
		throw new Error('Not implemented')
	}
}
