import {
	createFailedQueryResult,
	createSuccessQueryResult,
	QueryErrorCode,
	type Query,
	type QueryResult,
} from './query'

/**
 * @description Base class for query use cases
 * Provides specialized functionality for handling queries
 * @typeparam TQuery - The type of query this use case can process
 * @typeparam TResult - The type of result this use case produces
 */
export abstract class QueryUseCase<
	TQuery extends Query = Query,
	TResult = any,
> {
	/**
	 * @description Executes the query
	 * @param query - The query to execute
	 * @returns A promise that resolves to the query result
	 */
	abstract execute(query: TQuery): Promise<QueryResult<TResult>>

	/**
	 * @description Public method to run the query
	 * This provides a consistent API and allows for pre/post processing
	 * @param query - The query to run
	 * @returns A promise that resolves to the query result
	 */
	async run(query: TQuery): Promise<QueryResult<TResult>> {
		try {
			// Pre-processing hook
			await this.beforeExecute(query)

			// Execute the query
			const result = await this.execute(query)

			// Post-processing hook
			await this.afterExecute(result)

			return result
		} catch (error) {
			// Error handling hook
			await this.onError(error, query)

			return createFailedQueryResult(
				error instanceof Error ? error.message : String(error),
				error instanceof Error && 'code' in error
					? (error as any).code
					: QueryErrorCode.INTERNAL_ERROR,
			)
		}
	}

	/**
	 * @description Hook called before executing the query
	 * @param query - The query to execute
	 */
	protected async beforeExecute(query: TQuery): Promise<void> {
		// Default implementation does nothing
	}

	/**
	 * @description Hook called after executing the query
	 * @param result - The result of the query execution
	 */
	protected async afterExecute(result: QueryResult<TResult>): Promise<void> {
		// Default implementation does nothing
	}

	/**
	 * @description Hook called when an error occurs during execution
	 * @param error - The error that occurred
	 * @param query - The query that caused the error
	 */
	protected async onError(error: any, query: TQuery): Promise<void> {
		// Default implementation does nothing
	}

	/**
	 * @description Creates a successful query result
	 * @param data - The data to include in the result
	 * @returns A successful query result
	 */
	protected success<T>(data: T): QueryResult<T> {
		return createSuccessQueryResult(data)
	}

	/**
	 * @description Creates a failed query result
	 * @param error - The error message
	 * @param errorCode - The error code
	 * @returns A failed query result
	 */
	protected failure(
		error: string,
		errorCode: QueryErrorCode | string = QueryErrorCode.INTERNAL_ERROR,
	): QueryResult<never> {
		return createFailedQueryResult(error, errorCode)
	}
}
