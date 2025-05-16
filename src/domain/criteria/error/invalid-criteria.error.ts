import { DomainError } from '@/domain/error'

export class InvalidCriteria extends DomainError {
	constructor(message: string, payload: Record<string, unknown>) {
		super({ message, payload })
	}

	getMessage(): string {
		return this.message
	}
}
