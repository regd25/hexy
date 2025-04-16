export class ApplicationError extends Error {
	constructor(
		message: string,
		readonly occurredAt: Date = new Date(),
	) {
		super(message)
		this.name = this.constructor.name
	}
}
