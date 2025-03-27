import { Event } from '@/domain/event/event'
import { DataRecord } from '@/domain/types'
import { UuidValueObject } from '@/domain/value-objects'

// Mock implementation of DomainEvent for testing
class TestDomainEvent extends Event {
	constructor(
		aggregateId: string,
		eventName: string = 'test.event',
		occurredOn: Date = new Date(),
	) {
		super(
			new UuidValueObject(aggregateId),
			{ value: eventName } as any,
			occurredOn,
		)
	}

	toPrimitives(): DataRecord {
		return {
			id: this.aggregateId.toString(),
			eventName: this.getEventName(),
			occurredOn: this.occurredOn.toISOString(),
		}
	}

	getEventName(): string {
		return this.routingKey.toString()
	}

	fromPrimitives(data: DataRecord): Event {
		return new TestDomainEvent(
			data.id as string,
			data.eventName as string,
			new Date(data.occurredOn as string),
		)
	}
}

describe('DomainEvent', () => {
	const aggregateId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
	const eventName = 'test.event'
	const fixedDate = new Date('2023-01-01T12:00:00Z')

	describe('constructor', () => {
		it('should create a domain event with the provided values', () => {
			const event = new TestDomainEvent(aggregateId, eventName, fixedDate)

			expect(event.aggregateId.toString()).toBe(aggregateId)
			expect(event.getEventName()).toBe(eventName)
			expect(event.occurredOn).toEqual(fixedDate)
		})

		it('should generate a unique eventId for each event', () => {
			const event1 = new TestDomainEvent(aggregateId)
			const event2 = new TestDomainEvent(aggregateId)

			expect(event1.aggregateId).toBeDefined()
			expect(event2.aggregateId).toBeDefined()
			expect(event1.aggregateId).not.toBe(event2.aggregateId)
		})
	})

	describe('getEventName', () => {
		it('should return the event name', () => {
			const event = new TestDomainEvent(aggregateId, eventName)

			expect(event.getEventName()).toBe(eventName)
		})
	})

	describe('toPrimitives', () => {
		it('should convert the event to primitives', () => {
			const event = new TestDomainEvent(aggregateId, eventName, fixedDate)
			const primitives = event.toPrimitives()

			expect(primitives).toEqual({
				id: aggregateId,
				eventName: eventName,
				occurredOn: fixedDate.toISOString(),
			})
		})
	})

	describe('fromPrimitives', () => {
		it('should recreate an event from primitives', () => {
			const originalEvent = new TestDomainEvent(
				aggregateId,
				eventName,
				fixedDate,
			)
			const primitives = originalEvent.toPrimitives()

			const recreatedEvent = originalEvent.fromPrimitives(primitives)

			expect(recreatedEvent).toBeInstanceOf(TestDomainEvent)
			expect(recreatedEvent.aggregateId.toString()).toBe(aggregateId)
			expect(recreatedEvent.getEventName()).toBe(eventName)
			expect(recreatedEvent.occurredOn).toEqual(fixedDate)
		})
	})
})
