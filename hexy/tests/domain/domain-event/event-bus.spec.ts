import { DataRecord, Event, EventBus, EventHandler, UuidValueObject } from 'hexy'

// Mock implementation of Event for testing
class TestEvent extends Event {
	constructor(aggregateId: string) {
		super(
			new UuidValueObject(aggregateId),
			{ value: 'test.event' } as any,
			new Date(),
		)
	}

	toPrimitives(): DataRecord {
		return {
			id: this.aggregateId.toString(),
			occurredOn: this.occurredOn.toISOString(),
		}
	}

	getEventName(): string {
		return 'TestEvent'
	}

	fromPrimitives(data: DataRecord): Event {
		return new TestEvent(data.id as string)
	}
}

// Another event type for testing multiple handlers
class AnotherTestEvent extends Event {
	constructor(aggregateId: string) {
		super(
			new UuidValueObject(aggregateId),
			{ value: 'another.test.event' } as any,
			new Date(),
		)
	}

	toPrimitives(): DataRecord {
		return {
			id: this.aggregateId.toString(),
			occurredOn: this.occurredOn.toISOString(),
		}
	}

	getEventName(): string {
		return 'AnotherTestEvent'
	}

	fromPrimitives(data: DataRecord): Event {
		return new AnotherTestEvent(data.id as string)
	}
}

class TestEventBus extends EventBus {
	publish(events: Event[]): Promise<void> {
		return Promise.resolve()
	}

	addListener<T extends Event>(listener: EventHandler<T>): void {
		// No-op implementation
	}
}

describe('EventBus', () => {
	let eventBus: EventBus
	const aggregateId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

	beforeEach(() => {
		eventBus = new TestEventBus()
	})

	describe('register', () => {
		it('should register an event handler for a specific event', () => {
			const mockHandler = jest.fn()
			const handler: EventHandler<TestEvent> = mockHandler

			eventBus.addListener(handler)

			// Publish an event to test if handler is registered
			const event = new TestEvent(aggregateId)
			eventBus.publish([event])

			expect(mockHandler).toHaveBeenCalledWith(event)
		})

		it('should register multiple handlers for different events', () => {
			const mockHandler1 = jest.fn()
			const mockHandler2 = jest.fn()

			const handler1: EventHandler<TestEvent> = mockHandler1

			const handler2: EventHandler<AnotherTestEvent> = mockHandler2

			eventBus.addListener(handler1)
			eventBus.addListener(handler2)

			const event1 = new TestEvent(aggregateId)
			const event2 = new AnotherTestEvent(aggregateId)

			eventBus.publish([event1, event2])

			expect(mockHandler1).toHaveBeenCalledWith(event1)
			expect(mockHandler2).toHaveBeenCalledWith(event2)
		})

		it('should register multiple handlers for the same event', () => {
			const mockHandler1 = jest.fn()
			const mockHandler2 = jest.fn()

			const handler1: EventHandler<TestEvent> = mockHandler1

			const handler2: EventHandler<TestEvent> = mockHandler2

			eventBus.addListener(handler1)
			eventBus.addListener(handler2)

			const event = new TestEvent(aggregateId)

			eventBus.publish([event])

			expect(mockHandler1).toHaveBeenCalledWith(event)
			expect(mockHandler2).toHaveBeenCalledWith(event)
		})
	})

	describe('publish', () => {
		it('should not throw when publishing an event with no handlers', () => {
			const event = new TestEvent(aggregateId)

			expect(() => {
				eventBus.publish([event])
			}).not.toThrow()
		})

		it('should call all registered handlers for the published events', () => {
			const mockHandler1 = jest.fn()
			const mockHandler2 = jest.fn()

			const handler1: EventHandler<TestEvent> = mockHandler1
			const handler2: EventHandler<AnotherTestEvent> = mockHandler2

			eventBus.addListener(handler1)
			eventBus.addListener(handler2)

			const event1 = new TestEvent(aggregateId)
			const event2 = new AnotherTestEvent(aggregateId)

			eventBus.publish([event1, event2])

			expect(mockHandler1).toHaveBeenCalledTimes(1)
			expect(mockHandler1).toHaveBeenCalledWith(event1)
			expect(mockHandler2).toHaveBeenCalledTimes(1)
			expect(mockHandler2).toHaveBeenCalledWith(event2)
		})

		it('should handle empty array of events', () => {
			const mockHandler = jest.fn()
			const handler: EventHandler<TestEvent> = mockHandler


			eventBus.addListener(handler)
			eventBus.publish([])

			expect(mockHandler).not.toHaveBeenCalled()
		})
	})
})
