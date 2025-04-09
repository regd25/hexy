import { Injectable } from '../../shared/di/injectable'
import type { Command, CommandResult } from './command'
import { CommandUseCase } from './command-use-case'

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
> extends CommandUseCase<TCommand, TResult> {
	/**
	 * @description Handles a command and returns a result
	 * @param command - The command to handle
	 * @returns A promise that resolves to the command result
	 */
	abstract handle(command: TCommand): Promise<CommandResult<TResult>>

	/**
	 * @description Implementation of the execute method
	 * Delegates to the handle method
	 * @param command - The command to execute
	 * @returns A promise that resolves to the command result
	 */
	async execute(command: TCommand): Promise<CommandResult<TResult>> {
		return this.handle(command)
	}
}
