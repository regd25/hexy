import { HttpMethod, type RouteMetadata } from '../types'

/**
 * Metadata key for route information
 */
const ROUTE_METADATA_KEY = 'express:route'

/**
 * Base route decorator factory
 */
function createRouteDecorator(method: HttpMethod) {
	return (path: string = ''): MethodDecorator => {
		return (
			target: Object,
			propertyKey: string | symbol,
			descriptor: PropertyDescriptor,
		) => {
			const metadata: RouteMetadata = { method, path }
			Reflect.defineMetadata(ROUTE_METADATA_KEY, metadata, target, propertyKey)
			return descriptor
		}
	}
}

/**
 * Get route metadata
 */
export function getRouteMetadata(
	target: any,
	propertyKey: string | symbol,
): RouteMetadata | undefined {
	return Reflect.getMetadata(ROUTE_METADATA_KEY, target, propertyKey)
}

/**
 * GET route decorator
 *
 * @example
 * ```typescript
 * @Get('/profile')
 * getProfile() {
 *   // ...
 * }
 * ```
 */
export const Get = createRouteDecorator(HttpMethod.GET)

/**
 * POST route decorator
 *
 * @example
 * ```typescript
 * @Post('/users')
 * createUser(@Body() userData: CreateUserDto) {
 *   // ...
 * }
 * ```
 */
export const Post = createRouteDecorator(HttpMethod.POST)

/**
 * PUT route decorator
 *
 * @example
 * ```typescript
 * @Put('/users/:id')
 * updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
 *   // ...
 * }
 * ```
 */
export const Put = createRouteDecorator(HttpMethod.PUT)

/**
 * DELETE route decorator
 *
 * @example
 * ```typescript
 * @Delete('/users/:id')
 * deleteUser(@Param('id') id: string) {
 *   // ...
 * }
 * ```
 */
export const Delete = createRouteDecorator(HttpMethod.DELETE)

/**
 * PATCH route decorator
 *
 * @example
 * ```typescript
 * @Patch('/users/:id')
 * partialUpdateUser(@Param('id') id: string, @Body() userData: Partial<UpdateUserDto>) {
 *   // ...
 * }
 * ```
 */
export const Patch = createRouteDecorator(HttpMethod.PATCH)
