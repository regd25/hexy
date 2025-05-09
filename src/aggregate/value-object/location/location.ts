import type { Address } from './address.value-object'
import type { City } from './city.value-object'
import type { Country } from './country.value-object'
import type { Latitude } from './latitude.value-object'
import type { Longitude } from './longitude.value-object'
import type { Point } from './point.value-object'
import type { State } from './state.value-object'
import type { Street } from './street.value-object'
import type { ZipCode } from './zip-code.value-object'

export type Location =
	| City
	| Point
	| Country
	| ZipCode
	| State
	| Street
	| Address
	| Longitude
	| Latitude
