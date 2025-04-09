import { Injectable } from '../dependency-injection/injectable'
import type { Query, QueryResult } from './query'
import { QueryUseCase } from './query-use-case'

/**
 * @description Abstract base class for query handlers
 * Query handlers are responsible for executing queries and producing results
 * @typeparam TQuery - The type of query this handler can process
 * @typeparam TResult - The type of result this handler produces
 */
@Injectable()
export abstract class QueryHandler<
	TQuery extends Query = Query,
	TResult = any,
> extends QueryUseCase<TQuery, TResult> {
	/**
	 * @description Handles a query and returns a result
	 * @param query - The query to handle
	 * @returns A promise that resolves to the query result
	 */
	abstract handle(query: TQuery): Promise<QueryResult<TResult>>

	/**
	 * @description Implementation of the execute method
	 * Delegates to the handle method
	 * @param query - The query to execute
	 * @returns A promise that resolves to the query result
	 */
	async execute(query: TQuery): Promise<QueryResult<TResult>> {
		return this.handle(query)
	}
}
