import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

type CountryCode = 'MX' | 'US' | 'ES'

export class ZipCodeValueObject extends StringValueObject {
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
			throw new InvalidValueObjectError('Invalid zip code format')
		}
	}

	protected validate(value: string): boolean {
		return ZipCodeValueObject.PATTERNS[this.country].test(value)
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
