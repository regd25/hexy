import { BaseUseCase } from './usecase'

/**
 * Base class for query-type use cases.
 * Queries represent operations that read data without modifying the system state.
 */
export abstract class QueryUseCase<Input, Output> extends BaseUseCase<
	Input,
	Output
> {
	// Specific query behavior can be added here
}
