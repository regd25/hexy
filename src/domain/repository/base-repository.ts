import type { AggregateRoot } from '@/domain/aggregate'
import type { Criteria } from '@/domain/criteria'
import type { Identifier } from '@/domain/value-object'

/**
 * @description Base repository interface
 * @template T - The type of aggregate root
 */
export interface BaseRepository<T extends AggregateRoot> {
	findById(id: Identifier): Promise<T>
	findAll(): Promise<T[]>
	matching(criteria: Criteria): Promise<T[]>
	count(criteria?: Criteria): Promise<number>
	exists(id: Identifier): Promise<boolean>
	clear(): void
}
