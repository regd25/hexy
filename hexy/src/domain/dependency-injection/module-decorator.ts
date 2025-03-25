import 'reflect-metadata'
import { Module, type ModuleOptions } from './module'

/**
 * Extended module options that include layer information
 */
export interface LayeredModuleOptions extends ModuleOptions {
	layer?: 'application' | 'domain' | 'infrastructure'
}

// Metadata key for storing module options
const MODULE_OPTIONS_METADATA_KEY = 'module:options'

/**
 * Decorator function that creates a Module class from the decorated class.
 * This allows defining modules in a more declarative way using decorators.
 *
 * The decorator automatically configures the module's constructor, so you don't need
 * to manually pass the options to super() in your module class.
 *
 * @example
 * ```typescript
 * @ModuleDecorator({
 *   providers: [UserService],
 *   imports: [DatabaseModule],
 *   exports: [UserService],
 *   layer: 'application'
 * })
 * export class UserModule extends Module {}
 * ```
 */
export function ModuleDecorator(options: LayeredModuleOptions): ClassDecorator {
	return function (target: any) {
		const moduleOptions: ModuleOptions = {
			providers: options.providers || [],
			imports: options.imports || [],
			exports: options.exports || [],
		}

		Reflect.defineMetadata(MODULE_OPTIONS_METADATA_KEY, moduleOptions, target)

		if (options.layer) {
			Reflect.defineMetadata('module:layer', options.layer, target)
		}

		const originalConstructor = target
		const newConstructor: any = function (...args: any[]) {
			const instance = Reflect.construct(
				originalConstructor,
				args,
				newConstructor,
			) as Module

			if (!instance.initialized) {
				Object.getPrototypeOf(instance).constructor.call(
					instance,
					Reflect.getMetadata(MODULE_OPTIONS_METADATA_KEY, target),
				)
			}

			return instance
		}

		Object.setPrototypeOf(newConstructor, originalConstructor)
		newConstructor.prototype = originalConstructor.prototype

		Object.getOwnPropertyNames(target).forEach((prop) => {
			if (prop !== 'prototype' && prop !== 'name' && prop !== 'length') {
				Object.defineProperty(
					newConstructor,
					prop,
					Object.getOwnPropertyDescriptor(target, prop)!,
				)
			}
		})

		const module = new Module(moduleOptions)
		Reflect.defineMetadata('di:module', module, newConstructor)

		return newConstructor
	}
}

/**
 * Function to get the layer of a module
 */
export function getModuleLayer(target: any): string | undefined {
	return Reflect.getMetadata('module:layer', target)
}

/**
 * Function to get the options used to configure a module
 */
export function getModuleOptions(target: any): ModuleOptions | undefined {
	return Reflect.getMetadata(MODULE_OPTIONS_METADATA_KEY, target)
}

/**
 * Convenience decorators for specific layer modules
 */
export function ApplicationModule(
	options: ModuleOptions,
): ClassDecorator {
	return ModuleDecorator({ ...options, layer: 'application' })
}

export function DomainModule(options: ModuleOptions): ClassDecorator {
	return ModuleDecorator({ ...options, layer: 'domain' })
}

export function InfrastructureModule(
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
