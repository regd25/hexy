/**
 * Supported HTTP methods
 */
export enum HttpMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	PATCH = 'PATCH',
}

/**
 * Controller metadata structure
 */
export interface ControllerMetadata {
	/**
	 * Base path for all routes in this controller
	 */
	path: string
}

/**
 * Route metadata structure
 */
export interface RouteMetadata {
	/**
	 * HTTP method
	 */
	method: HttpMethod

	/**
	 * Route path relative to controller base path
	 */
	path: string
}

/**
 * Parameter types for route handlers
 */
export enum ParamType {
	BODY = 'body',
	QUERY = 'query',
	PARAM = 'param',
	REQUEST = 'request',
	RESPONSE = 'response',
	NEXT = 'next',
}

/**
 * Parameter metadata structure
 */
export interface ParamMetadata {
	/**
	 * Parameter type
	 */
	type: ParamType

	/**
	 * Parameter name (for body, query, param)
	 */
	name?: string

	/**
	 * Parameter index in method signature
	 */
	index: number
}
