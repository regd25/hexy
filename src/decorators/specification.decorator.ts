export interface SpecificationMetadata {
	context: string
	description?: string
}

/**
 * Decorator for Specification classes.
 * Registers metadata about the specification's context and purpose.
 *
 * @param metadata Configuration metadata for the specification
 */
export function Specification(metadata: SpecificationMetadata): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('specification:context', metadata.context, target)
		Reflect.defineMetadata(
			'specification:description',
			metadata.description || '',
			target,
		)
		return target
	}
}
