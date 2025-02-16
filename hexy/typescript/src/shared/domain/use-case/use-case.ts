import { UseCaseInput } from './use-case-input'
import { UseCaseOutput } from './use-case-output'

/**
 * @description Abstract class for a use case
 */
export abstract class UseCase<
	Input extends UseCaseInput = UseCaseInput,
	Output extends UseCaseOutput = UseCaseOutput,
> {
	/**
	 * @description Executes the use case
	 * @param input - The input of the use case
	 * @returns The output of the use case
	 */
	abstract execute(input: Input): Promise<Output>
}
