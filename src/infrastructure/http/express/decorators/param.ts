import { ParamType, ParamMetadata } from '../types'
import { Request, Response, NextFunction } from 'express'
import { CustomParameterDecorator } from './typings'

/**
 * Metadata key for parameter information
 */
const PARAMS_METADATA_KEY = 'express:params'

/**
 * Create parameter decorator
 */
function createParamDecorator(
	type: ParamType,
	paramName?: string,
): CustomParameterDecorator {
	return function (
		target: Object,
		propertyKey: string | symbol,
		parameterIndex: number,
	): void {
		const metadata: ParamMetadata = {
			type,
			name: paramName,
			index: parameterIndex,
		}

		// Get existing metadata or initialize empty array
		const existingMetadata: ParamMetadata[] =
			Reflect.getMetadata(PARAMS_METADATA_KEY, target, propertyKey) || []

		// Add new metadata
		existingMetadata.push(metadata)

		// Update metadata
		Reflect.defineMetadata(
			PARAMS_METADATA_KEY,
			existingMetadata,
			target,
			propertyKey,
		)
	}
}

/**
 * Get parameter metadata
 */
export function getParamMetadata(
	target: any,
	propertyKey: string | symbol,
): ParamMetadata[] {
	return Reflect.getMetadata(PARAMS_METADATA_KEY, target, propertyKey) || []
}

/**
 * Extract parameter value from request
 */
export function extractParamValue(
	metadata: ParamMetadata,
	req: Request,
	res: Response,
	next: NextFunction,
): any {
	switch (metadata.type) {
		case ParamType.BODY:
			return metadata.name ? req.body[metadata.name] : req.body
		case ParamType.QUERY:
			return metadata.name ? req.query[metadata.name] : req.query
		case ParamType.PARAM:
			return metadata.name ? req.params[metadata.name] : req.params
		case ParamType.REQUEST:
			return req
		case ParamType.RESPONSE:
			return res
		case ParamType.NEXT:
			return next
		default:
			return undefined
	}
}

/**
 * Body parameter decorator
 *
 * @example
 * ```typescript
 * @Post()
 * createUser(@Body() userData: CreateUserDto) {
 *   // userData contains the request body
 * }
 *
 * @Post()
 * createUser(@Body('name') name: string) {
 *   // name contains req.body.name
 * }
 * ```
 */
export function Body(paramName?: string): CustomParameterDecorator {
	return createParamDecorator(ParamType.BODY, paramName)
}

/**
 * Query parameter decorator
 *
 * @example
 * ```typescript
 * @Get()
 * findUsers(@Query('role') role: string) {
 *   // role contains req.query.role
 * }
 * ```
 */
export function Query(paramName?: string): CustomParameterDecorator {
	return createParamDecorator(ParamType.QUERY, paramName)
}

/**
 * Path parameter decorator
 *
 * @example
 * ```typescript
 * @Get(':id')
 * getUser(@Param('id') id: string) {
 *   // id contains req.params.id
 * }
 * ```
 */
export function Param(paramName?: string): CustomParameterDecorator {
	return createParamDecorator(ParamType.PARAM, paramName)
}

/**
 * Request object decorator
 *
 * @example
 * ```typescript
 * @Get()
 * getUser(@Req() req: Request) {
 *   // req is the Express Request object
 * }
 * ```
 */
export function Req(): CustomParameterDecorator {
	return createParamDecorator(ParamType.REQUEST)
}

/**
 * Response object decorator
 *
 * @example
 * ```typescript
 * @Get()
 * getUser(@Res() res: Response) {
 *   // res is the Express Response object
 *   return res.status(200).json({ ... })
 * }
 * ```
 */
export function Res(): CustomParameterDecorator {
	return createParamDecorator(ParamType.RESPONSE)
}

/**
 * NextFunction decorator
 *
 * @example
 * ```typescript
 * @Get()
 * getUser(@Next() next: NextFunction) {
 *   // next is the Express NextFunction
 * }
 * ```
 */
export function Next(): CustomParameterDecorator {
	return createParamDecorator(ParamType.NEXT)
}
