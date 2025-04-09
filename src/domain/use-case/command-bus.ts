import { Injectable } from '../dependency-injection/injectable'
import { Container } from '../dependency-injection/container'
import { type Command, type CommandResult } from './command'
import { CommandHandler } from './command-handler'
import { type IContext } from '../contexts/context'

/**
 * @description Exception thrown when a command handler is not found
 */
export class CommandHandlerNotFoundException extends Error {
  constructor(commandType: string) {
    super(`No handler found for command type: ${commandType}`)
    this.name = 'CommandHandlerNotFoundException'
  }
}

/**
 * @description Registry for command handlers
 * Maps command types to their handlers
 */
@Injectable()
export class CommandHandlerRegistry {
  private handlers = new Map<string, CommandHandler>()

  /**
   * @description Registers a command handler
   * @param commandType - The command type
   * @param handler - The handler instance
   */
  register(commandType: string, handler: CommandHandler): void {
    this.handlers.set(commandType, handler)
  }

  /**
   * @description Gets a handler for a command type
   * @param commandType - The command type
   * @returns The handler for the command type or undefined if not found
   */
  getHandler(commandType: string): CommandHandler | undefined {
    return this.handlers.get(commandType)
  }

  /**
   * @description Checks if a handler is registered for a command type
   * @param commandType - The command type
   * @returns True if a handler is registered, false otherwise
   */
  hasHandler(commandType: string): boolean {
    return this.handlers.has(commandType)
  }
}

/**
 * @description Service for dispatching commands to their handlers
 */
@Injectable()
export class CommandBus {
  constructor(
    private readonly registry: CommandHandlerRegistry,
    private readonly container: Container,
  ) {}

  /**
   * @description Dispatches a command to its handler
   * @param command - The command to dispatch
   * @param context - Optional execution context
   * @returns A promise that resolves to the command result
   * @throws CommandHandlerNotFoundException if no handler is found
   */
  async dispatch<TCommand extends Command, TResult = any>(
    command: TCommand,
    context?: IContext
  ): Promise<CommandResult<TResult>> {
    const { commandType } = command

    // Try to get a handler from the registry
    let handler = this.registry.getHandler(commandType)

    // If no handler is registered, try to resolve it from the container
    if (!handler) {
      try {
        // Convention: MyCommand -> MyCommandHandler
        const handlerName = `${commandType}Handler`
        handler = this.container.resolve(handlerName)
        
        // Register the handler for future use
        if (handler) {
          this.registry.register(commandType, handler)
        }
      } catch (error) {
        throw new CommandHandlerNotFoundException(commandType)
      }
    }

    if (!handler) {
      throw new CommandHandlerNotFoundException(commandType)
    }

    // If a context is provided, register the command with the orchestrator
    if (context && this.orchestrator) {
      return this.orchestrator.execute(`${commandType}Handler`, {
        ...command,
        context
      }) as Promise<CommandResult<TResult>>
    }

    // Otherwise, execute the handler directly
    return handler.run(command) as Promise<CommandResult<TResult>>
  }
} 