import { AggregateRoot } from '../aggregate'
import type { DataRecord } from '../types'

/**
 * Data Access Object Interface.
 * Defines methods for basic CRUD operations on data records,
 * typically mapping between domain entities and database rows/documents.
 * @template E - The domain entity type (extends AggregateRoot).
 * @template P - The primitive/plain object representation of the entity.
 */
export interface Dao<E extends AggregateRoot, P extends DataRecord> {
	/**
	 * Transforms a domain entity into its primitive representation.
	 * @param entity - The domain entity.
	 * @returns The primitive representation.
	 */
	toPersistence(entity: E): P

	/**
	 * Transforms a primitive representation into a domain entity.
	 * @param persistence - The primitive representation.
	 * @returns The domain entity.
	 */
	toDomain(persistence: P): E
}
