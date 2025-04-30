import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

type CountryCode = 'MX' | 'US' | 'ES'

export class ZipCode extends ValueObject<string> {
	private static readonly PATTERNS: Record<CountryCode, RegExp> = {
		MX: /^\d{5}$/,
		US: /^\d{5}(-\d{4})?$/,
		ES: /^\d{5}$/,
	}

	constructor(
		value: string,
		readonly country: CountryCode,
	) {
		super(value.trim().replace(/\s/g, ''))
		if (!this.validate(this.value)) {
			throw new InvalidValueObject('Invalid zip code format')
		}
	}

	protected validate(value: string): boolean {
		return ZipCode.PATTERNS[this.country].test(value)
	}

	toFormattedString(): string {
		const formats: Record<CountryCode, string> = {
			MX: this.value,
			US:
				this.value.length === 9
					? `${this.value.slice(0, 5)}-${this.value.slice(5)}`
					: this.value,
			ES: this.value,
		}
		return formats[this.country]
	}
}
