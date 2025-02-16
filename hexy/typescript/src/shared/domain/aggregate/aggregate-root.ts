import { DomainEvent } from '../domain-event/domain-event'
import { DataRecord } from '../types'
import { IdentifierValueObject } from '../value-objects'

export abstract class AggregateRoot {
	abstract id: IdentifierValueObject
	private events: DomainEvent[] = []

	getEvents(): DomainEvent[] {
		return this.events
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

	abstract fromPrimitives(primitives: DataRecord): AggregateRoot
}
