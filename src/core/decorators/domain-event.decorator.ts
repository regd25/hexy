export interface DomainEventOptions {
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
export function DomainEvent(options: DomainEventOptions): ClassDecorator {
	return function (target: any) {
		const finalName = options.name || target.name
		Reflect.defineMetadata('domainEvent:context', options.context, target)
		Reflect.defineMetadata('domainEvent:name', finalName, target)
		Reflect.defineMetadata(
			'domainEvent:version',
			options.version || 'v1',
			target,
		)
		Reflect.defineMetadata(
			'domainEvent:description',
			options.description || '',
			target,
		)

		return target
	}
}
