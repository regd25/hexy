export interface RegisterEventMetadata {
	context: string
	version?: string
	description?: string
	name?: string
}

/**
 * Decorator for Domain Event classes.
 * Registers metadata like context, version, and description.
 *
 * @param options Configuration options for the domain event
 */
export function RegisterEvent(metadata: RegisterEventMetadata): ClassDecorator {
	return function (target: any) {
		const finalName = metadata.name || target.name
		Reflect.defineMetadata('domainEvent:context', metadata.context, target)
		Reflect.defineMetadata('domainEvent:name', finalName, target)
		Reflect.defineMetadata(
			'domainEvent:version',
			metadata.version || 'v1',
			target,
		)
		Reflect.defineMetadata(
			'domainEvent:description',
			metadata.description || '',
			target,
		)

		return target
	}
}
