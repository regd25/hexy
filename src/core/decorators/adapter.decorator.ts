import type { Class } from '../types'

export interface AdapterOptions {
	technology: string
	context: string
	forPort: Class
	description?: string
}

/**
 * Decorator for Adapter implementations.
 * Registers metadata about the technology used and the port implemented.
 *
 * @param options Configuration options for the adapter
 */
export function Adapter(options: AdapterOptions): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('adapter:technology', options.technology, target)
		Reflect.defineMetadata('adapter:context', options.context, target)
		Reflect.defineMetadata('adapter:forPort', options.forPort, target)
		Reflect.defineMetadata(
			'adapter:description',
			options.description || '',
			target,
		)

		Reflect.defineMetadata('injectable', true, target)

		return target
	}
}
