/**
 * Decorator to mark a class (UseCase, Service, EventHandler) for automatic tracing.
 * This typically just adds a metadata flag that observability systems can check.
 */
export function Traceable(): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('traceable', true, target)
		return target
	}
}
