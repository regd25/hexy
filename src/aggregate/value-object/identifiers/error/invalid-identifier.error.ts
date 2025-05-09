import { DomainError } from '@/error'
import type { Class } from '@/types'

export class InvalidIdentifier extends DomainError {
	constructor(identifier: Class, payload: Record<string, string>) {
		let message = 'Invalid identifier'

		switch (identifier.name) {
			case 'RoutingKey':
				message = `Invalid routing key ${payload['routingKey']}`
				break
			case 'NumberId':
				message = `Invalid number id ${payload['numberId']}`
				break
			case 'DocumentNumber':
				message = `Invalid document number ${payload['documentNumber']}`
				break
			case 'Uuid':
				message = `Invalid uuid ${payload['uuid']}`
				break
			default:
				message = `Invalid identifier`
				break
		}

		super({ message })
	}

	getMessage(): string {
		return this.message
	}
}
