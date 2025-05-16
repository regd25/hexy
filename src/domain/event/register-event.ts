/**
 * Decorator for Domain Event classes.
 * Registers metadata like context, version, and description.
 *
 * @param options Configuration options for the domain event
 */
export function RegisterEvent(name: string): ClassDecorator {
	return function (target: any) {
		const finalName = name || target.name
		Reflect.defineMetadata('domainEvent:name', finalName, target)
		return target
	}
}
