export class InvalidValueObject extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'InvalidValueObject'
	}
}
