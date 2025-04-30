import { Traceable } from './traceable.decorator'

export interface ServiceOptions {
	context: string
	description?: string
	traceable?: boolean
}

/**
 * Decorator for Domain Services or Application Services.
 * Registers metadata and marks the class as injectable.
 *
 * @param options Configuration options for the service
 */
export function Service(options: ServiceOptions): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('service:context', options.context, target)
		Reflect.defineMetadata(
			'service:description',
			options.description || '',
			target,
		)
		Reflect.defineMetadata(
			'service:traceable',
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
