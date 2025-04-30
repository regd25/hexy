export interface SpecificationOptions {
	context: string
	description?: string
}

/**
 * Decorator for Specification classes.
 * Registers metadata about the specification's context and purpose.
 *
 * @param options Configuration options for the specification
 */
export function Specification(options: SpecificationOptions): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('specification:context', options.context, target)
		Reflect.defineMetadata(
			'specification:description',
			options.description || '',
			target,
		)
		return target
	}
}
