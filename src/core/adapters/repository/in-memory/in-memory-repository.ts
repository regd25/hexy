import { Repository, EventBus } from 'core/port'
import type { AggregateRoot, IdentifierValueObject } from 'core/aggregate'
import type { Criteria } from 'core/port'

/**
 * In-memory implementation of Repository for testing and prototyping
 * @template T - The type of aggregate root
 */
export class InMemoryRepository<T extends AggregateRoot> extends Repository<T> {
	private items: Map<string, T> = new Map()

	constructor(eventBus?: EventBus) {
		super(eventBus)
	}

	/**
	 * Finds an aggregate by its identifier
	 * @param id - The identifier of the aggregate
	 * @returns The aggregate or null if not found
	 */
	async findById(id: IdentifierValueObject): Promise<T> {
		const key = id.toString()
		const item = this.items.get(key)
		if (!item) {
			throw new Error(`Aggregate with id ${id.toString()} not found`)
		}
		return item
	}

	/**
	 * Finds all aggregates
	 * @returns All aggregates
	 */
	async findAll(): Promise<T[]> {
		return Array.from(this.items.values())
	}

	/**
	 * Finds aggregates matching the given criteria
	 * @param criteria - The criteria to match
	 * @returns Aggregates matching the criteria
	 */
	async matching(criteria: Criteria): Promise<T[]> {
		return Array.from(this.items.values()).filter((item) => {
			const primitives = item.toPrimitives()

			for (const [field, value] of Object.entries(
				criteria.toPrimitives().filters || {},
			)) {
				if (primitives[field] !== value) {
					return false
				}
			}

			return true
		})
	}

	/**
	 * Deletes an aggregate by its identifier
	 * @param id - The identifier of the aggregate to delete
	 */
	async delete(id: IdentifierValueObject): Promise<void> {
		this.items.delete(id.toString())
	}

	/**
	 * Counts aggregates matching the given criteria
	 * @param criteria - The criteria to match
	 * @returns The number of matching aggregates
	 */
	async count(criteria?: Criteria): Promise<number> {
		if (!criteria) {
			return this.items.size
		}

		const matches = await this.matching(criteria)
		return matches.length
	}

	/**
	 * Checks if an aggregate with the given identifier exists
	 * @param id - The identifier to check
	 * @returns True if the aggregate exists, false otherwise
	 */
	async exists(id: IdentifierValueObject): Promise<boolean> {
		return this.items.has(id.toString())
	}

	/**
	 * Persists an aggregate to the in-memory storage
	 * @param aggregate - The aggregate to persist
	 */
	protected async persist(aggregate: T): Promise<void> {
		this.items.set(aggregate.id.toString(), aggregate)
	}

	/**
	 * Clears all items from the repository
	 */
	clear(): void {
		this.items.clear()
	}
}
