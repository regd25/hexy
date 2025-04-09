import type { UseCaseInput } from './use-case-input'

/**
 * @description Base interface for commands in CQRS
 * Commands represent intentions to change the state of the system
 */
export interface Command extends UseCaseInput {
	/**
	 * Unique identifier for the command type
	 */
	readonly commandType: string
}

/**
 * @description Generic command result interface
 * Represents the result of a command execution
 */
export interface CommandResult<T = any> {
	/**
	 * Whether the command was successful
	 */
	success: boolean

	/**
	 * Optional result data
	 */
	data?: T

	/**
	 * Error message if the command failed
	 */
	error?: string

	/**
	 * Error code if the command failed
	 */
	errorCode?: string
}
