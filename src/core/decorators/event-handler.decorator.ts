import type { Class } from '../types'
import type { DomainEvent } from '../event'
import { Traceable } from './traceable.decorator'

export interface EventHandlerOptions {
	event: Class<DomainEvent>
	context: string
	description?: string
	traceable?: boolean
}

/**
 * Decorator for Event Handlers.
 * Registers metadata about the event being handled and marks the handler as injectable.
 *
 * @param options Configuration options for the event handler
 */
export function EventHandler(options: EventHandlerOptions): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('eventHandler:event', options.event, target)
		Reflect.defineMetadata('eventHandler:context', options.context, target)
		Reflect.defineMetadata(
			'eventHandler:description',
			options.description || '',
			target,
		)
		Reflect.defineMetadata(
			'eventHandler:traceable',
			options.traceable !== undefined ? options.traceable : true,
			target,
		)

		Reflect.defineMetadata('injectable', true, target)

		if (options.traceable !== false) {
			Traceable()(target)
		}

		return target
	}
}
