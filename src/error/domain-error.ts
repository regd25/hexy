export abstract class DomainError extends Error {
	readonly name: string
	readonly parameters: Record<string, unknown>
	readonly timestamp: string

	constructor(parameters: Record<string, unknown> = {}) {
		super()
		this.name = this.constructor.name
		this.parameters = parameters
		this.timestamp = new Date().toISOString()

		Error.captureStackTrace?.(this, this.constructor)
	}

	abstract getMessage(): string

	getCode(): string {
		return this.name.toUpperCase()
	}

	toString(): string {
		return JSON.stringify(this.toJSON())
	}

	toJSON(): Record<string, unknown> {
		return {
			error: this.getCode(),
			message: this.getMessage(),
			parameters: this.parameters,
			timestamp: this.timestamp,
		}
	}
}
