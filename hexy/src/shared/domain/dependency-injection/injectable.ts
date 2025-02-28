/**
 * Decorator that marks a class as available to be injected as a dependency.
 * This is part of the dependency injection system in Hexy.
 *
 * @example
 * @Injectable()
 * export class MyService {
 *   // ...
 * }
 */
export function Injectable(): ClassDecorator {
	return (target: any) => {
		Reflect.defineMetadata('injectable', true, target)
		return target
	}
}
