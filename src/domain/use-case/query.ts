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
	errorCode?: string
}
