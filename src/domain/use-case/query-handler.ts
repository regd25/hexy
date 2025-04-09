import { UseCase } from './use-case'
import { type Query, type QueryResult } from './query'
import { Injectable } from '../dependency-injection/injectable'

/**
 * @description Abstract base class for query handlers
 * Query handlers are responsible for executing queries and producing results
 * @typeparam TQuery - The type of query this handler can process
 * @typeparam TResult - The type of result this handler produces
 */
@Injectable()
export abstract class QueryHandler<
  TQuery extends Query = Query,
  TResult = any
> extends UseCase<TQuery, QueryResult<TResult>> {
  /**
   * @description Handles a query and returns a result
   * @param query - The query to handle
   * @returns A promise that resolves to the query result
   */
  abstract handle(query: TQuery): Promise<QueryResult<TResult>>

  /**
   * @description Implementation of the execute method from UseCase
   * Delegates to the handle method
   * @param query - The query to execute
   * @returns A promise that resolves to the query result
   */
  async execute(query: TQuery): Promise<QueryResult<TResult>> {
    try {
      return await this.handle(query)
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        errorCode: error instanceof Error && 'code' in error 
          ? (error as any).code 
          : 'UNKNOWN_ERROR'
      }
    }
  }

  /**
   * @description Creates a successful query result
   * @param data - The data to include in the result
   * @returns A successful query result
   */
	protected success<T>(data: T): QueryResult<T> {
		return {
			success: true,
			data,
		}
	}

  /**
   * @description Creates a failed query result
   * @param error - The error message
   * @param errorCode - The error code
   * @returns A failed query result
   */
  protected failure(error: string, errorCode: string = 'QUERY_FAILED'): QueryResult<TResult> {
    return {
      success: false,
      error,
      errorCode
    }
  }
} 