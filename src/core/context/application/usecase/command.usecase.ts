import { BaseUseCase } from './usecase'

/**
 * Base class for command-type use cases.
 * Commands represent operations that modify the system state.
 */
export abstract class CommandUseCase<Input, Output> extends BaseUseCase<
	Input,
	Output
> {
	// Specific command behavior can be added here
}
