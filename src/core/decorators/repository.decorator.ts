import type { Class } from '../types'
import type { AggregateRoot } from '../aggregate'

export interface RepositoryOptions {
	entity: Class<AggregateRoot> 
	technology: string // e.g., 'Postgres', 'InMemory', 'Mongo'
	context: string
	description?: string
}

/**
 * Decorator for Repository implementations (Adapters).
 * Registers metadata about the entity managed, technology, and context.
 *
 * @param options Configuration options for the repository implementation
 */
export function Repository(options: RepositoryOptions): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('repository:entity', options.entity, target)
		Reflect.defineMetadata('repository:technology', options.technology, target)
		Reflect.defineMetadata('repository:context', options.context, target)
		Reflect.defineMetadata(
			'repository:description',
			options.description || '',
			target,
		)

		Reflect.defineMetadata('injectable', true, target)

		return target
	}
}
