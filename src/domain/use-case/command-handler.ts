import { UseCase } from './use-case'
import { type Command, type CommandResult } from './command'
import { Injectable } from '../dependency-injection/injectable'

/**
 * @description Abstract base class for command handlers
 * Command handlers are responsible for executing commands and producing results
 * @typeparam TCommand - The type of command this handler can process
 * @typeparam TResult - The type of result this handler produces
 */
@Injectable()
export abstract class CommandHandler<
	TCommand extends Command = Command,
	TResult = any,
> extends UseCase<TCommand, CommandResult<TResult>> {
	/**
	 * @description Handles a command and returns a result
	 * @param command - The command to handle
	 * @returns A promise that resolves to the command result
	 */
	abstract handle(command: TCommand): Promise<CommandResult<TResult>>

	/**
	 * @description Implementation of the execute method from UseCase
	 * Delegates to the handle method
	 * @param command - The command to execute
	 * @returns A promise that resolves to the command result
	 */
	async execute(command: TCommand): Promise<CommandResult<TResult>> {
		try {
			return await this.handle(command)
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
				errorCode:
					error instanceof Error && 'code' in error
						? (error as any).code
						: 'UNKNOWN_ERROR',
			}
		}
	}

	/**
	 * @description Creates a successful command result
	 * @param data - The data to include in the result
	 * @returns A successful command result
	 */
	protected success<T>(data?: T): CommandResult<T> {
		return {
			success: true,
			data,
		}
	}

	/**
	 * @description Creates a failed command result
	 * @param error - The error message
	 * @param errorCode - The error code
	 * @returns A failed command result
	 */
	protected failure(
		error: string,
		errorCode: string = 'COMMAND_FAILED',
	): CommandResult<TResult> {
		return {
			success: false,
			error,
			errorCode,
		}
	}
}
