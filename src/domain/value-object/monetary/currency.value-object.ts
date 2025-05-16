import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

/**
 * @description Represents ISO 4217 currency codes
 */
export class Currency extends ValueObject<keyof typeof Currency.Currency> {
	static readonly Currency = {
		USD: 'USD',
		EUR: 'EUR',
		GBP: 'GBP',
		JPY: 'JPY',
		CAD: 'CAD',
		CHF: 'CHF',
		MXN: 'MXN',
		ARS: 'ARS',
		CLP: 'CLP',
		COP: 'COP',
		CRC: 'CRC',
		CUP: 'CUP',
		CVE: 'CVE',
		CZK: 'CZK',
		DKK: 'DKK',
		DOP: 'DOP',
	} as const

	/**
	 * @description Creates a new Currency instance.
	 * @param value - The currency code.
	 */
	constructor(value: keyof typeof Currency.Currency) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject(Currency, value)
		}
	}

	protected validate(value: keyof typeof Currency.Currency): boolean {
		return Object.values(Currency.Currency).includes(
			value as keyof typeof Currency.Currency,
		)
	}
}
