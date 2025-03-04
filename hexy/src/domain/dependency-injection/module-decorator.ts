import 'reflect-metadata'
import { Module, ModuleOptions } from './module'

/**
 * Extended module options that include layer information
 */
export interface LayeredModuleOptions extends ModuleOptions {
	layer?: 'application' | 'domain' | 'infrastructure'
}

/**
 * Decorator function that creates a Module class from the decorated class.
 * This allows defining modules in a more declarative way using decorators.
 *
 * @example
 * ```typescript
 * @ModuleDecorator({
 *   providers: [UserService],
 *   imports: [DatabaseModule],
 *   exports: [UserService],
 *   layer: 'application'
 * })
 * export class UserModule {}
 * ```
 */
export function ModuleDecorator(options: LayeredModuleOptions): ClassDecorator {
	return function (target: any) {
		const moduleOptions: ModuleOptions = {
			providers: options.providers || [],
			imports: options.imports || [],
			exports: options.exports || [],
		}

		// Create module instance
		const module = new Module(moduleOptions)

		// Store layer information if provided
		if (options.layer) {
			Reflect.defineMetadata('module:layer', options.layer, target)
		}

		// Replace the target's constructor with one that returns the module
		const newConstructor = function () {
			return module
		}

		// Copy prototype properties
		Object.setPrototypeOf(newConstructor, target)

		// Copy own properties
		Object.getOwnPropertyNames(target).forEach((prop) => {
			if (prop !== 'prototype' && prop !== 'name' && prop !== 'length') {
				Object.defineProperty(
					newConstructor,
					prop,
					Object.getOwnPropertyDescriptor(target, prop)!,
				)
			}
		})

		return newConstructor as any
	}
}

/**
 * Function to get the layer of a module
 */
export function getModuleLayer(target: any): string | undefined {
	return Reflect.getMetadata('module:layer', target)
}

/**
 * Convenience decorators for specific layer modules
 */
export function ApplicationModuleDecorator(
	options: ModuleOptions,
): ClassDecorator {
	return ModuleDecorator({ ...options, layer: 'application' })
}

export function DomainModuleDecorator(options: ModuleOptions): ClassDecorator {
	return ModuleDecorator({ ...options, layer: 'domain' })
}

export function InfrastructureModuleDecorator(
	options: ModuleOptions,
): ClassDecorator {
	return ModuleDecorator({ ...options, layer: 'infrastructure' })
}

/**
 * Gets the module definition from a module class.
 */
export function getModuleFromClass(moduleClass: any): Module | null {
	return Reflect.getMetadata('di:module', moduleClass)
}
