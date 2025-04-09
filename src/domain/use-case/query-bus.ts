import { Injectable } from '../dependency-injection/injectable'
import { Container } from '../dependency-injection/container'
import { Query, QueryResult } from './query'
import { QueryHandler } from './query-handler'
import { IContext } from '../contexts/context'
import { UseCaseOrchestrator } from './use-case-orchestrator'

/**
 * @description Exception thrown when a query handler is not found
 */
export class QueryHandlerNotFoundException extends Error {
  constructor(queryType: string) {
    super(`No handler found for query type: ${queryType}`)
    this.name = 'QueryHandlerNotFoundException'
  }
}

/**
 * @description Registry for query handlers
 * Maps query types to their handlers
 */
@Injectable()
export class QueryHandlerRegistry {
  private handlers = new Map<string, QueryHandler>()

  /**
   * @description Registers a query handler
   * @param queryType - The query type
   * @param handler - The handler instance
   */
  register(queryType: string, handler: QueryHandler): void {
    this.handlers.set(queryType, handler)
  }

  /**
   * @description Gets a handler for a query type
   * @param queryType - The query type
   * @returns The handler for the query type or undefined if not found
   */
  getHandler(queryType: string): QueryHandler | undefined {
    return this.handlers.get(queryType)
  }

  /**
   * @description Checks if a handler is registered for a query type
   * @param queryType - The query type
   * @returns True if a handler is registered, false otherwise
   */
  hasHandler(queryType: string): boolean {
    return this.handlers.has(queryType)
  }
}

/**
 * @description Service for dispatching queries to their handlers
 */
@Injectable()
export class QueryBus {
  constructor(
    private readonly registry: QueryHandlerRegistry,
    private readonly container: Container,
    private readonly orchestrator: UseCaseOrchestrator
  ) {}

  /**
   * @description Dispatches a query to its handler
   * @param query - The query to dispatch
   * @param context - Optional execution context
   * @returns A promise that resolves to the query result
   * @throws QueryHandlerNotFoundException if no handler is found
   */
  async dispatch<TQuery extends Query, TResult = any>(
    query: TQuery,
    context?: IContext
  ): Promise<QueryResult<TResult>> {
    const { queryType } = query

    // Try to get a handler from the registry
    let handler = this.registry.getHandler(queryType)

    // If no handler is registered, try to resolve it from the container
    if (!handler) {
      try {
        // Convention: MyQuery -> MyQueryHandler
        const handlerName = `${queryType}Handler`
        handler = this.container.resolve(handlerName)
        
        // Register the handler for future use
        if (handler) {
          this.registry.register(queryType, handler)
        }
      } catch (error) {
        throw new QueryHandlerNotFoundException(queryType)
      }
    }

    if (!handler) {
      throw new QueryHandlerNotFoundException(queryType)
    }

    // If a context is provided, register the query with the orchestrator
    if (context && this.orchestrator) {
      return this.orchestrator.execute(`${queryType}Handler`, {
        ...query,
        context
      }) as Promise<QueryResult<TResult>>
    }

    // Otherwise, execute the handler directly
    return handler.run(query) as Promise<QueryResult<TResult>>
  }
} 