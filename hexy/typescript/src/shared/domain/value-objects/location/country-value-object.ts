import { EnumValueObject } from '../primitives/enum-value-object'

type CountryData = {
	name: string
	phoneCode: string
	currency: string
}

export class CountryValueObject extends EnumValueObject<
	typeof CountryValueObject.Country
> {
	static readonly Country = {
		MX: 'MX',
		US: 'US',
		ES: 'ES',
	} as const

	private static readonly COUNTRY_DATA: Record<
		keyof typeof CountryValueObject.Country,
		CountryData
	> = {
		MX: { name: 'Mexico', phoneCode: '+52', currency: 'MXN' },
		US: { name: 'United States', phoneCode: '+1', currency: 'USD' },
		ES: { name: 'Spain', phoneCode: '+34', currency: 'EUR' },
	}

	constructor(value: string) {
		super(value, CountryValueObject.Country)
	}

	get countryData(): CountryData {
		return CountryValueObject.COUNTRY_DATA[
			this.enumKey as keyof typeof CountryValueObject.Country
		]
	}

	get name(): string {
		return this.countryData.name
	}

	get phoneCode(): string {
		return this.countryData.phoneCode
	}

	get currency(): string {
		return this.countryData.currency
	}

	get timezone(): string {
		return 'America/Mexico_City'
	}
}
