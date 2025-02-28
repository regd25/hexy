import { ValueObject } from '../value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

type StreetProps = {
	number: number
	complement: string
}

export class StreetValueObject extends ValueObject<StreetProps> {
	constructor(value: string | StreetProps) {
		const parsed =
			typeof value === 'string' ? StreetValueObject.parseString(value) : value

		super({
			number: parsed.number,
			complement: parsed.complement.trim(),
		})

		this.validate()
	}

	private static parseString(value: string): StreetProps {
		const match = value.match(/^(\d+)\s+(.*)/)
		return {
			number: match ? parseInt(match[1], 10) : 0,
			complement: match ? match[2] : value,
		}
	}

	protected validate(): boolean {
		if (!Number.isInteger(this.value.number) || this.value.number <= 0) {
			throw new InvalidValueObjectError('Invalid street number')
		}

		if (this.value.complement.length > 255) {
			throw new InvalidValueObjectError('Street complement too long')
		}

		return true
	}

	get fullStreet(): string {
		return `${this.value.number} ${this.value.complement}`
	}
}
