export class InvalidValueObjectError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'InvalidValueObjectError'
	}
}
