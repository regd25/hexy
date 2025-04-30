import type { DataRecord } from 'src/core/types'
import type { DomainEvent } from '../event/domain-event'
import type { Identifier } from './value-object'

/**
 * @description Abstract class for aggregate roots
 */
export abstract class AggregateRoot {
	/**
	 * @description The id of the aggregate root
	 */
	abstract id: Identifier

	/**
	 * @description The events of the aggregate root
	 */
	private events: DomainEvent[] = []

	private version: number = 0

	getEvents(): DomainEvent[] {
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

	protected apply(event: DomainEvent): void {
		this.events.push(event)
	}

	protected applyEvents(events: DomainEvent[]): void {
		events.forEach((event) => this.apply(event))
	}

	abstract toPrimitives(): DataRecord

	static fromPrimitives(primitives: DataRecord): AggregateRoot {
		throw new Error('Not implemented')
	}
}
