export interface ValueObjectMetadata {
	aggregate?: string
	name?: string
	description?: string
	primitive?: 'string' | 'number' | 'boolean' | 'Date' | string
}

/**
 * Decorator for Value Objects.
 * Registers metadata like context, description, and primitive type.
 *
 * @param options Configuration options for the value object
 */
export function ValueObject(metadata: ValueObjectMetadata): ClassDecorator {
	return function (target: any) {
		const finalName = metadata.name || target.name
		Reflect.defineMetadata('valueObject:aggregate', metadata.aggregate, target)
		Reflect.defineMetadata('valueObject:name', finalName, target)
		Reflect.defineMetadata(
			'valueObject:description',
			metadata.description || '',
			target,
		)
		Reflect.defineMetadata(
			'valueObject:primitive',
			metadata.primitive || '',
			target,
		)

		return target
	}
}
