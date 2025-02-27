import { EnumValueObject } from '../primitives/enum-value-object'

/**
 * Represents ISO 4217 currency codes
 */
export class CurrencyValueObject extends EnumValueObject<
	typeof CurrencyValueObject.Currency
> {
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

	constructor(value: string) {
		super(value, CurrencyValueObject.Currency)
	}
}
