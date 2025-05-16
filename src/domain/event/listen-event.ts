/**
 * Decorator for Domain Event classes.
 * Registers metadata like context, version, and description.
 *
 * @param options Configuration options for the domain event
 */
export function ListenEvent(name: string): ClassDecorator {
	return function (target: any) {
		const finalName = name || target.name
		Reflect.defineMetadata('listenEvent:name', finalName, target)
		return target
	}
}
