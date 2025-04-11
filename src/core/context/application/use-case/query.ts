import type { UseCaseInput } from './use-case-input'

/**
 * @description Base interface for queries in CQRS
 * Queries represent intentions to retrieve data without changing the state
 */
export interface Query extends UseCaseInput {
	/**
	 * Unique identifier for the query type
	 */
	readonly queryType: string
}

/**
 * @description Error codes for query failures
 */
export enum QueryErrorCode {
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	NOT_FOUND = 'NOT_FOUND',
	UNAUTHORIZED = 'UNAUTHORIZED',
	INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * @description Generic query result interface
 * Represents the result of a query execution
 */
export interface QueryResult<T = any> {
	/**
	 * Whether the query was successful
	 */
	success: boolean

	/**
	 * The data returned by the query
	 */
	data?: T

	/**
	 * Error message if the query failed
	 */
	error?: string

	/**
	 * Error code if the query failed
	 */
	errorCode?: QueryErrorCode | string
}

/**
 * Creates a successful query result
 */
export function createSuccessQueryResult<T>(data: T): QueryResult<T> {
	return {
		success: true,
		data
	}
}

/**
 * Creates a failed query result
 */
export function createFailedQueryResult(
	error: string, 
	errorCode: QueryErrorCode | string = QueryErrorCode.INTERNAL_ERROR
): QueryResult<never> {
	return {
		success: false,
		error,
		errorCode
	}
}
