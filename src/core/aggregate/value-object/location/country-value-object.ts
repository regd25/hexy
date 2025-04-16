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
		keyof typeof CountryValueObject.Country,
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
		switch (this.enumKey) {
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
