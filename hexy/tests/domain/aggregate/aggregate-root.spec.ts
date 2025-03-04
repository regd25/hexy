import { AbstractAggregate } from '@/domain/aggregate'
import { Criteria } from '@/domain/criteria'
import { EventBus } from '@/domain/event-bus/event-bus'
import {
	IdentifierValueObject,
	UuidValueObject,
} from '@/domain/value-objects'
import { InMemoryRepository } from '@/infrastructure/persistence'
import { DataRecord } from '@/domain/types'
import { AbstractDomainEvent } from '@/domain/domain-event/abstract-domain-event'

// Mock implementation of AbstractAggregate for testing
class TestAggregate extends AbstractAggregate {
	constructor(
		public readonly id: UuidValueObject,
		private readonly name: string,
		private readonly active: boolean = true,
	) {
		super()
	}

	static create(
		id: string,
		name: string,
		active: boolean = true,
	): TestAggregate {
		return new TestAggregate(new UuidValueObject(id), name, active)
	}

	toPrimitives(): DataRecord {
		return {
			id: this.id.toString(),
			name: this.name,
			active: this.active,
		}
	}

	fromPrimitives(primitives: DataRecord): AbstractAggregate {
		return TestAggregate.create(
			primitives.id as string,
			primitives.name as string,
			primitives.active as boolean,
		)
	}

	deactivate(): void {
		// Ejemplo de método que podría generar un evento
		this.apply(new TestAggregateDeactivated(this.id.toString()))
	}
}

// Mock implementation of DomainEvent for testing
class TestAggregateDeactivated extends AbstractDomainEvent {
	constructor(aggregateId: string) {
		super(
			new UuidValueObject(aggregateId),
			{ value: 'test.aggregate.deactivated' } as any,
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
		return 'TestAggregateDeactivated'
	}

	fromPrimitives(data: DataRecord): AbstractDomainEvent {
		return new TestAggregateDeactivated(data.id as string)
	}
}

describe('InMemoryRepository', () => {
	let repository: InMemoryRepository<TestAggregate>
	let eventBus: EventBus
	let aggregate1: TestAggregate
	let aggregate2: TestAggregate

	beforeEach(() => {
		// Mock EventBus
		eventBus = {
			publish: jest.fn().mockResolvedValue(undefined),
			addListener: jest.fn(),
		}

		repository = new InMemoryRepository<TestAggregate>(eventBus)

		// Create test aggregates
		aggregate1 = TestAggregate.create(
			'f47ac10b-58cc-4372-a567-0e02b2c3d479',
			'Test Aggregate 1',
			true,
		)

		aggregate2 = TestAggregate.create(
			'00000000-0000-4000-8000-000000000000',
			'Test Aggregate 2',
			false,
		)
	})

	afterEach(() => {
		repository.clear()
		jest.clearAllMocks()
	})

	describe('save', () => {
		it('should persist an aggregate', async () => {
			await repository.save(aggregate1)

			const found = await repository.findById(aggregate1.id)
			expect(found).toBeDefined()
			expect(found?.id.toString()).toBe(aggregate1.id.toString())
		})

		it('should publish events when saving an aggregate with events', async () => {
			// Trigger an event
			aggregate1.deactivate()

			await repository.save(aggregate1)

			expect(eventBus.publish).toHaveBeenCalled()
		})
	})

	describe('findById', () => {
		it('should return the aggregate when it exists', async () => {
			await repository.save(aggregate1)

			const found = await repository.findById(aggregate1.id)
			expect(found).toBeDefined()
			expect(found?.id.toString()).toBe(aggregate1.id.toString())
		})

		it('should return null when the aggregate does not exist', async () => {
			const nonExistentId = new UuidValueObject(
				'11111111-1111-4111-8111-111111111111',
			)

			const found = await repository.findById(nonExistentId)
			expect(found).toBeNull()
		})
	})

	describe('findAll', () => {
		it('should return all aggregates', async () => {
			await repository.save(aggregate1)
			await repository.save(aggregate2)

			const all = await repository.findAll()
			expect(all).toHaveLength(2)
			expect(all.map((a) => a.id.toString())).toContain(
				aggregate1.id.toString(),
			)
			expect(all.map((a) => a.id.toString())).toContain(
				aggregate2.id.toString(),
			)
		})

		it('should return empty array when no aggregates exist', async () => {
			const all = await repository.findAll()
			expect(all).toHaveLength(0)
		})
	})

	describe('matching', () => {
		it('should return aggregates matching criteria', async () => {
			await repository.save(aggregate1)
			await repository.save(aggregate2)

			// Create a criteria that matches only active aggregates
			const criteria = {
				toPrimitive: () => ({
					filters: { active: true },
				}),
			} as unknown as Criteria

			const matches = await repository.matching(criteria)
			expect(matches).toHaveLength(1)
			expect(matches[0].id.toString()).toBe(aggregate1.id.toString())
		})
	})

	describe('delete', () => {
		it('should delete an aggregate', async () => {
			await repository.save(aggregate1)

			await repository.delete(aggregate1.id)

			const found = await repository.findById(aggregate1.id)
			expect(found).toBeNull()
		})
	})

	describe('count', () => {
		it('should count all aggregates when no criteria is provided', async () => {
			await repository.save(aggregate1)
			await repository.save(aggregate2)

			const count = await repository.count()
			expect(count).toBe(2)
		})

		it('should count aggregates matching criteria', async () => {
			await repository.save(aggregate1)
			await repository.save(aggregate2)

			// Create a criteria that matches only active aggregates
			const criteria = {
				toPrimitive: () => ({
					filters: { active: true },
				}),
			} as unknown as Criteria

			const count = await repository.count(criteria)
			expect(count).toBe(1)
		})
	})

	describe('exists', () => {
		it('should return true when the aggregate exists', async () => {
			await repository.save(aggregate1)

			const exists = await repository.exists(aggregate1.id)
			expect(exists).toBe(true)
		})

		it('should return false when the aggregate does not exist', async () => {
			const nonExistentId = new UuidValueObject(
				'11111111-1111-4111-8111-111111111111',
			)

			const exists = await repository.exists(nonExistentId)
			expect(exists).toBe(false)
		})
	})
})
