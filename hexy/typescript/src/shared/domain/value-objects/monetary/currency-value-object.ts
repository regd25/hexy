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
		// Agregar más códigos según necesidad
	} as const

	constructor(value: string) {
		super(value, CurrencyValueObject.Currency)
	}
}
