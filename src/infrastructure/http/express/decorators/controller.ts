import { Injectable } from '../../../../domain/dependency-injection'
import { ControllerMetadata } from '../types'

/**
 * Metadata key for controller information
 */
const CONTROLLER_METADATA_KEY = 'express:controller'

/**
 * Controller decorator that marks a class as an HTTP controller
 * and defines the base path for all routes in this controller.
 *
 * @example
 * ```typescript
 * @Controller('/api/users')
 * export class UserController {
 *   // ...
 * }
 * ```
 */
export function Controller(path: string = ''): ClassDecorator {
	return (target: Function) => {
		// Make sure the controller is injectable
		Injectable()(target)

		// Store controller metadata
		const metadata: ControllerMetadata = { path }
		Reflect.defineMetadata(CONTROLLER_METADATA_KEY, metadata, target)
	}
}

/**
 * Get controller metadata
 * @param target Controller class
 */
export function getControllerMetadata(
	target: any,
): ControllerMetadata | undefined {
	return Reflect.getMetadata(CONTROLLER_METADATA_KEY, target)
}
