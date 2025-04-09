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
 * @description Error codes for command failures
 */
export enum CommandErrorCode {
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
	NOT_FOUND = 'NOT_FOUND',
	UNAUTHORIZED = 'UNAUTHORIZED',
	CONFLICT = 'CONFLICT',
	INTERNAL_ERROR = 'INTERNAL_ERROR'
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
	errorCode?: CommandErrorCode | string
}

/**
 * Creates a successful command result
 */
export function createSuccessCommandResult<T>(data?: T): CommandResult<T> {
	return {
		success: true,
		data
	}
}

/**
 * Creates a failed command result
 */
export function createFailedCommandResult(
	error: string, 
	errorCode: CommandErrorCode | string = CommandErrorCode.INTERNAL_ERROR
): CommandResult<never> {
	return {
		success: false,
		error,
		errorCode
	}
}
