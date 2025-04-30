import { ValueObject } from '../value-object'
import { City } from './city.value-object'
import { State } from './state.value-object'
import { Street } from './street.value-object'
import { ZipCode } from './zip-code.value-object'
import { Country } from '../location/country.value-object'

type AddressProps = {
	street: Street
	city: City
	state: State
	country: Country
	zipCode: ZipCode
}

// TODO: Add @ValueObject decorator once context is defined
export class Address extends ValueObject<AddressProps> {
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
