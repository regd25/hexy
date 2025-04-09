import { CountryValueObject } from '../location/country-value-object'
import { ValueObject } from '../value-object'
import { CityValueObject } from './city-value-object'
import { StateValueObject } from './state-value-object'
import { StreetValueObject } from './street-value-object'
import { ZipCodeValueObject } from './zip-code-value-object'

type AddressProps = {
	street: StreetValueObject
	city: CityValueObject
	state: StateValueObject
	country: CountryValueObject
	zipCode: ZipCodeValueObject
}

export class AddressValueObject extends ValueObject<AddressProps> {
	constructor(value: AddressProps) {
		super(value)
	}

	protected validate(): boolean {
		return true
	}

	get fullAddress(): string {
		return `${this.value.street.fullStreet}, ${this.value.city.toString()}, ${this.value.state.toString()}, ${this.value.country.toString()}, ${this.value.zipCode.toFormattedString()}`
	}

	get streetValue(): string {
		return this.value.street.fullStreet
	}

	get cityValue(): string {
		return this.value.city.toString()
	}

	get stateValue(): string {
		return this.value.state.toString()
	}

	get countryValue(): string {
		return this.value.country.toString()
	}

	get zipCodeValue(): string {
		return this.value.zipCode.toFormattedString()
	}
}