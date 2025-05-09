import type { Class } from '../types'
import type { AggregateRoot } from '../aggregate'

export interface RepositoryMetadata {
	entity: Class<AggregateRoot>
	technology: string // e.g., 'Postgres', 'InMemory', 'Mongo'
	context: string
	description?: string
}

/**
 * Decorator for Repository implementations (Adapters).
 * Registers metadata about the entity managed, technology, and context.
 *
 * @param metadata Configuration metadata for the repository implementation
 */
export function RegisterRepository(
	metadata: RepositoryMetadata,
): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('repository:entity', metadata.entity, target)
		Reflect.defineMetadata('repository:technology', metadata.technology, target)
		Reflect.defineMetadata('repository:context', metadata.context, target)
		Reflect.defineMetadata(
			'repository:description',
			metadata.description || '',
			target,
		)

		Reflect.defineMetadata('injectable', true, target)

		return target
	}
}
