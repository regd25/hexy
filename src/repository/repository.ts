import type { AggregateRoot, Identifier } from '@/aggregate'

/**
 * @description Base repository interface
 * @template T - The type of aggregate root
 */
export interface Repository<T extends AggregateRoot> {
	findById(id: Identifier): Promise<T>
}
