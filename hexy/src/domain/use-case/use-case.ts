import { UseCaseInput } from './use-case-input'
import { UseCaseOutput } from './use-case-output'

/**
 * @description Abstract class for a use case
 *
 * Use cases represent application-specific business logic.
 * They orchestrate the flow of data to and from the domain layer entities,
 * and delegate the actual domain logic to the domain layer entities themselves.
 *
 * Use cases should follow the Single Responsibility Principle and be focused on one specific task.
 * They are the entry point to the application layer in the hexagonal architecture.
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

	/**
	 * @description Public method to run the use case
	 * This provides a consistent API and allows for pre/post processing
	 * @param input - The input of the use case
	 * @returns The output of the use case
	 */
	async run(input: Input): Promise<Output> {
		try {
			// Pre-processing hook (can be overridden in subclasses)
			await this.beforeExecute(input)

			// Execute the use case
			const result = await this.execute(input)

			// Post-processing hook (can be overridden in subclasses)
			await this.afterExecute(result)

			return result
		} catch (error) {
			// Error handling hook (can be overridden in subclasses)
			await this.onError(error, input)
			throw error
		}
	}

	/**
	 * @description Hook called before executing the use case
	 * Override this method to add custom pre-processing logic
	 * @param input - The input of the use case
	 */
	protected async beforeExecute(input: Input): Promise<void> {
		// Default implementation does nothing
	}

	/**
	 * @description Hook called after executing the use case
	 * Override this method to add custom post-processing logic
	 * @param output - The output of the use case
	 */
	protected async afterExecute(output: Output): Promise<void> {
		// Default implementation does nothing
	}

	/**
	 * @description Hook called when an error occurs during execution
	 * Override this method to add custom error handling logic
	 * @param error - The error that occurred
	 * @param input - The input that caused the error
	 */
	protected async onError(error: any, input: Input): Promise<void> {
		// Default implementation does nothing
	}
}
