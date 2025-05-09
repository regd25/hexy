import { Traceable } from './traceable.decorator'

export interface ServiceMetadata {
	context: string
	description?: string
	traceable?: boolean
}

/**
 * Decorator for Domain Services or Application Services.
 * Registers metadata and marks the class as injectable.
 *
 * @param metadata Configuration metadata for the service
 */
export function RegisterService(metadata: ServiceMetadata): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('service:context', metadata.context, target)
		Reflect.defineMetadata(
			'service:description',
			metadata.description || '',
			target,
		)
		Reflect.defineMetadata(
			'service:traceable',
			metadata.traceable !== undefined ? metadata.traceable : true,
			target,
		)

		Reflect.defineMetadata('injectable', true, target)

		if (metadata.traceable !== false) {
			Traceable()(target)
		}

		return target
	}
}
