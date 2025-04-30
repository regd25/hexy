/**
 * @description Abstract class for domain errors
 */
export abstract class DomainError extends Error {
	/**
	 * @description The parameters of the error
	 */
	constructor(readonly parameters: Record<string, unknown>) {
		super()
	}

	/**
	 * @description Get the message of the error
	 */
	abstract getMessage(): string
}
