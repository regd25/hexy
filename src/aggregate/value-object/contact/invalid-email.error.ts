import { DomainError } from '@hexy/error'

export class InvalidEmail extends DomainError {
	constructor(value: string) {
		super({
			message: `Invalid email: ${value}`,
		})
	}

	getMessage(): string {
		return this.message
	}
}
