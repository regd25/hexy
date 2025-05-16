import { ValueObject } from '../value-object'
import { InvalidLocation } from './error/invalid-location.error'

export type StreetProps = {
	number: number
	complement: string
}

export class Street extends ValueObject<StreetProps> {
	constructor(value: string | StreetProps) {
		const parsed = typeof value === 'string' ? Street.parseString(value) : value

		super({
			number: parsed.number,
			complement: parsed.complement.trim(),
		})
	}

	private static parseString(value: string): StreetProps {
		const match = value.match(/^(\d+)\s+(.*)/)
		return {
			number: match ? parseInt(match[1], 10) : 0,
			complement: match ? match[2] : value,
		}
	}

	validate(value: StreetProps): boolean {
		if (!Number.isInteger(value.number) || value.number <= 0) {
			throw new InvalidLocation(Street, { street: value.toString() })
		}

		if (value.complement.length > 255) {
			throw new InvalidLocation(Street, { street: value.toString() })
		}

		return true
	}

	get fullStreet(): string {
		return `${this.value.number} ${this.value.complement}`
	}
}
