import { BaseUseCase } from './base.usecase'

/**
 * Base class for command-type use cases.
 * Commands represent operations that modify the system state.
 */
export abstract class CommandUseCase<Input, Output> extends BaseUseCase<
	Input,
	Output
> {
	abstract execute(input: Input): Promise<Output>
}
