/**
 * Defines the lifecycle of an injectable dependency.
 *
 * - SINGLETON: A single instance is created and shared across the application
 * - TRANSIENT: A new instance is created each time the dependency is requested
 * - REQUEST: A new instance is created for each HTTP request (in web applications)
 */
export enum Scope {
	SINGLETON = 'singleton',
	TRANSIENT = 'transient',
	REQUEST = 'request',
}

/**
 * Decorator that specifies the lifecycle scope of an injectable class.
 *
 * @example
 * @Injectable()
 * @Scoped(Scope.TRANSIENT)
 * export class MyService {
 *   // ...
 * }
 */
export function Scoped(scope: Scope): ClassDecorator {
	return (target: any) => {
		Reflect.defineMetadata('scope', scope, target)
		return target
	}
}
