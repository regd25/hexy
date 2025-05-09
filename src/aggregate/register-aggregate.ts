import type { Class } from '../types'
import type { DomainEvent } from '../event'
import type { InjectionToken } from '../di'

export interface AggregateMetadata {
	context: string
	events?: Class<DomainEvent>[]
	commandHandlers?: InjectionToken[]
	description?: string
	version?: string
	name?: string
}

/**
 * Decorator for Aggregate Root classes.
 * Registers metadata including context, events, command handlers, etc.
 *
 * @param metadata Configuration metadata for the aggregate root
 */
export function RegisterAggregate(metadata: AggregateMetadata): ClassDecorator {
	return function (target: any) {
		const finalName = metadata.name || target.name
		Reflect.defineMetadata('aggregate:context', metadata.context, target)
		Reflect.defineMetadata('aggregate:name', finalName, target)
		Reflect.defineMetadata('aggregate:events', metadata.events || [], target)
		Reflect.defineMetadata(
			'aggregate:commandHandlers',
			metadata.commandHandlers || [],
			target,
		)
		Reflect.defineMetadata(
			'aggregate:description',
			metadata.description || '',
			target,
		)
		Reflect.defineMetadata('aggregate:version', metadata.version || 'v1', target)

		return target
	}
}
