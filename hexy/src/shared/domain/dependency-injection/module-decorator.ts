import { Module, ModuleOptions } from './module'

/**
 * Decorator that defines a class as a DI module.
 *
 * @example
 * @ModuleDecorator({
 *   providers: [UserService, AuthService],
 *   imports: [CommonModule],
 *   exports: [UserService]
 * })
 * export class UserModule {}
 */
export function ModuleDecorator(options: ModuleOptions): ClassDecorator {
	return (target: any) => {
		// Create a module instance with the provided options
		const module = new Module(options)

		// Store the module instance on the class
		Reflect.defineMetadata('di:module', module, target)

		return target
	}
}

/**
 * Gets the module definition from a module class.
 */
export function getModuleFromClass(moduleClass: any): Module | null {
	return Reflect.getMetadata('di:module', moduleClass)
}
