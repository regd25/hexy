import {
	CommandErrorCode,
	createFailedCommandResult,
	createSuccessCommandResult,
	type Command,
	type CommandResult,
} from './command'

/**
 * @description Base class for command use cases
 * Provides specialized functionality for handling commands
 * @typeparam TCommand - The type of command this use case can process
 * @typeparam TResult - The type of result this use case produces
 */
export abstract class CommandUseCase<
	TCommand extends Command = Command,
	TResult = any,
> {
	/**
	 * @description Executes the command
	 * @param command - The command to execute
	 * @returns A promise that resolves to the command result
	 */
	abstract execute(command: TCommand): Promise<CommandResult<TResult>>

	/**
	 * @description Public method to run the command
	 * This provides a consistent API and allows for pre/post processing
	 * @param command - The command to run
	 * @returns A promise that resolves to the command result
	 */
	async run(command: TCommand): Promise<CommandResult<TResult>> {
		try {
			// Pre-processing hook
			await this.beforeExecute(command)

			// Execute the command
			const result = await this.execute(command)

			// Post-processing hook
			await this.afterExecute(result)

			return result
		} catch (error) {
			// Error handling hook
			await this.onError(error, command)

			return createFailedCommandResult(
				error instanceof Error ? error.message : String(error),
				error instanceof Error && 'code' in error
					? (error as any).code
					: CommandErrorCode.INTERNAL_ERROR,
			)
		}
	}

	/**
	 * @description Hook called before executing the command
	 * @param command - The command to execute
	 */
	protected async beforeExecute(command: TCommand): Promise<void> {
		// Default implementation does nothing
	}

	/**
	 * @description Hook called after executing the command
	 * @param result - The result of the command execution
	 */
	protected async afterExecute(result: CommandResult<TResult>): Promise<void> {
		// Default implementation does nothing
	}

	/**
	 * @description Hook called when an error occurs during execution
	 * @param error - The error that occurred
	 * @param command - The command that caused the error
	 */
	protected async onError(error: any, command: TCommand): Promise<void> {
		// Default implementation does nothing
	}

	/**
	 * @description Creates a successful command result
	 * @param data - The data to include in the result
	 * @returns A successful command result
	 */
	protected success<T>(data?: T): CommandResult<T> {
		return createSuccessCommandResult(data)
	}

	/**
	 * @description Creates a failed command result
	 * @param error - The error message
	 * @param errorCode - The error code
	 * @returns A failed command result
	 */
	protected failure(
		error: string,
		errorCode: CommandErrorCode | string = CommandErrorCode.INTERNAL_ERROR,
	): CommandResult<never> {
		return createFailedCommandResult(error, errorCode)
	}
}
