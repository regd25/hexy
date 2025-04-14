/**
 * Base UseCase abstract class for implementing the command pattern.
 * This class defines the template method for executing use cases with
 * standard hooks for before/after execution and error handling.
 */
export abstract class BaseUseCase<Input, Output> {
	/**
	 * Main execution method that must be implemented by concrete use cases.
	 * Contains the core business logic.
	 */
	abstract execute(input: Input): Promise<Output>

	/**
	 * Public entry point for invoking the use case. Orchestrates the entire
	 * execution flow including hooks.
	 */
	async run(input: Input): Promise<Output> {
		try {
			await this.beforeExecute(input)
			const result = await this.execute(input)
			await this.afterExecute(result)
			return result
		} catch (error) {
			await this.onError(error, input)
			throw error
		}
	}

	/**
	 * Hook executed before the main execution. Can be overridden
	 * by subclasses for additional preprocessing.
	 */
	protected async beforeExecute(input: Input): Promise<void> {}

	/**
	 * Hook executed after successful execution. Can be overridden
	 * by subclasses for additional postprocessing.
	 */
	protected async afterExecute(output: Output): Promise<void> {}

	/**
	 * Hook executed when an error occurs. Can be overridden
	 * by subclasses for custom error handling.
	 */
	protected async onError(error: any, input: Input): Promise<void> {}
}
