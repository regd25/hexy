import type { Class } from '../types'
import type { DomainEvent } from '../event'
import type { InjectionToken } from '../di'

export interface AggregateOptions {
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
 * @param options Configuration options for the aggregate root
 */
export function Aggregate(options: AggregateOptions): ClassDecorator {
	return function (target: any) {
		const finalName = options.name || target.name
		Reflect.defineMetadata('aggregate:context', options.context, target)
		Reflect.defineMetadata('aggregate:name', finalName, target)
		Reflect.defineMetadata('aggregate:events', options.events || [], target)
		Reflect.defineMetadata(
			'aggregate:commandHandlers',
			options.commandHandlers || [],
			target,
		)
		Reflect.defineMetadata(
			'aggregate:description',
			options.description || '',
			target,
		)
		Reflect.defineMetadata('aggregate:version', options.version || 'v1', target)

		return target
	}
}
