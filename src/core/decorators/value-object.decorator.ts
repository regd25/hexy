export interface ValueObjectOptions {
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
export function ValueObject(options: ValueObjectOptions): ClassDecorator {
	return function (target: any) {
		const finalName = options.name || target.name
		Reflect.defineMetadata('valueObject:aggregate', options.aggregate, target)
		Reflect.defineMetadata('valueObject:name', finalName, target)
		Reflect.defineMetadata(
			'valueObject:description',
			options.description || '',
			target,
		)
		Reflect.defineMetadata(
			'valueObject:primitive',
			options.primitive || '',
			target,
		)

		return target
	}
}
