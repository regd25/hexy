import type { Class } from '../types';

export interface FactoryOptions {
	context: string;
	target?: Class<any>; // The class this factory builds (optional but recommended)
	description?: string;
}

/**
 * Decorator for Factory classes.
 * Registers metadata about the factory's context and target.
 *
 * @param options Configuration options for the factory
 */
export function Factory(options: FactoryOptions): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('factory:context', options.context, target);
		Reflect.defineMetadata('factory:target', options.target, target);
		Reflect.defineMetadata('factory:description', options.description || '', target);

		Reflect.defineMetadata('injectable', true, target)

		return target;
	};
} 