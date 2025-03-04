import { AbstractAggregate } from '../../aggregate'
import { Criteria } from '../../criteria'
import { DomainRepository } from '../../dependency-injection'
import { EventBus } from '../../event-bus/event-bus'
import { IdentifierValueObject } from '../../value-objects'
import { Repository } from './repository'

/**
 * Abstract implementation of Repository that provides common functionality
 * @template T - The type of aggregate root
 */
@DomainRepository()
export abstract class AbstractRepository<T extends AbstractAggregate>
	implements Repository<T>
{
	constructor(protected readonly eventBus?: EventBus) {}

	/**
	 * Saves an aggregate and publishes its domain events
	 * @param aggregate - The aggregate to save
	 */
	async save(aggregate: T): Promise<void> {
		await this.persist(aggregate)
		await this.publishEvents(aggregate)
	}

	/**
	 * Finds an aggregate by its identifier
	 * @param id - The identifier of the aggregate
	 * @returns The aggregate or null if not found
	 */
	abstract findById(id: IdentifierValueObject): Promise<T | null>

	/**
	 * Finds all aggregates
	 * @returns All aggregates
	 */
	abstract findAll(): Promise<T[]>

	/**
	 * Finds aggregates matching the given criteria
	 * @param criteria - The criteria to match
	 * @returns Aggregates matching the criteria
	 */
	abstract matching(criteria: Criteria): Promise<T[]>

	/**
	 * Deletes an aggregate by its identifier
	 * @param id - The identifier of the aggregate to delete
	 */
	abstract delete(id: IdentifierValueObject): Promise<void>

	/**
	 * Counts aggregates matching the given criteria
	 * @param criteria - The criteria to match
	 * @returns The number of matching aggregates
	 */
	abstract count(criteria?: Criteria): Promise<number>

	/**
	 * Checks if an aggregate with the given identifier exists
	 * @param id - The identifier to check
	 * @returns True if the aggregate exists, false otherwise
	 */
	abstract exists(id: IdentifierValueObject): Promise<boolean>

	/**
	 * Persists an aggregate to the storage
	 * @param aggregate - The aggregate to persist
	 */
	protected abstract persist(aggregate: T): Promise<void>

	/**
	 * Publishes the domain events of an aggregate
	 * @param aggregate - The aggregate whose events to publish
	 */
	private async publishEvents(aggregate: T): Promise<void> {
		const events = aggregate.getEvents()

		if (events.length > 0 && this.eventBus) {
			await this.eventBus.publish(events)
			aggregate.incrementVersion()
		}
	}
}
