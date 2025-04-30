import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

type CountryData = {
	name: string
	phoneCode: string
	currency: string
}

export class Country extends ValueObject<keyof typeof Country.Country> {
	static readonly Country = {
		MX: 'MX',
		US: 'US',
		ES: 'ES',
		AR: 'AR',
		CO: 'CO',
		CL: 'CL',
		PE: 'PE',
		VE: 'VE',
		EC: 'EC',
		CR: 'CR',
		CU: 'CU',
		CZ: 'CZ',
		DK: 'DK',
		DOP: 'DOP',
	} as const

	private static readonly COUNTRY_DATA: Record<
		keyof typeof Country.Country,
		CountryData
	> = {
		MX: { name: 'Mexico', phoneCode: '+52', currency: 'MXN' },
		US: { name: 'United States', phoneCode: '+1', currency: 'USD' },
		ES: { name: 'Spain', phoneCode: '+34', currency: 'EUR' },
		AR: { name: 'Argentina', phoneCode: '+54', currency: 'ARS' },
		CO: { name: 'Colombia', phoneCode: '+57', currency: 'COP' },
		CL: { name: 'Chile', phoneCode: '+56', currency: 'CLP' },
		PE: { name: 'Peru', phoneCode: '+51', currency: 'PEN' },
		VE: { name: 'Venezuela', phoneCode: '+58', currency: 'VEF' },
		EC: { name: 'Ecuador', phoneCode: '+593', currency: 'USD' },
		CR: { name: 'Costa Rica', phoneCode: '+506', currency: 'CRC' },
		CU: { name: 'Cuba', phoneCode: '+53', currency: 'CUP' },
		CZ: { name: 'Czechia', phoneCode: '+420', currency: 'CZK' },
		DK: { name: 'Denmark', phoneCode: '+45', currency: 'DKK' },
		DOP: { name: 'Dominican Republic', phoneCode: '+1', currency: 'DOP' },
	}

	constructor(value: keyof typeof Country.Country) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject('Invalid country')
		}
	}

	protected validate(value: keyof typeof Country.Country): boolean {
		return Object.values(Country.Country).includes(value)
	}

	get countryData(): CountryData {
		return Country.COUNTRY_DATA[this.value as keyof typeof Country.Country]
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
		switch (this.value) {
			case 'MX':
				return 'America/Mexico_City'
			case 'US':
				return 'America/New_York'
			case 'ES':
				return 'Europe/Madrid'
			case 'AR':
				return 'America/Argentina/Buenos_Aires'
			case 'CO':
				return 'America/Bogota'
			case 'CL':
				return 'America/Santiago'
			case 'PE':
				return 'America/Lima'
			case 'VE':
				return 'America/Caracas'
			case 'EC':
				return 'America/Quito'
			case 'CR':
				return 'America/Costa_Rica'
			case 'CU':
				return 'America/Havana'
			case 'CZ':
				return 'Europe/Prague'
			case 'DK':
				return 'Europe/Copenhagen'
			case 'DOP':
				return 'America/Santo_Domingo'
			default:
				return 'America/Mexico_City'
		}
	}
}
