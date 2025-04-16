import { DecimalValueObject } from '../primitives/decimal-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'
import { LatitudeValueObject } from './latitude-value-object'
import { LongitudeValueObject } from './longitude-value-object'
import { ValueObject } from '../value-object'

type Coordinates = {
	latitude: LatitudeValueObject
	longitude: LongitudeValueObject
}

export class LocationValueObject extends ValueObject<Coordinates> {
	constructor(latitude: number, longitude: number) {
		super({
			latitude: new LatitudeValueObject(latitude),
			longitude: new LongitudeValueObject(longitude),
		})
	}

	protected validate(value: Coordinates): boolean {
		return (
			value.latitude instanceof LatitudeValueObject &&
			value.longitude instanceof LongitudeValueObject
		)
	}

	/**
	 * Calcula la distancia en kilómetros usando la fórmula de Haversine
	 */
	distanceTo(other: LocationValueObject): number {
		const R = 6371 // Radio de la Tierra en km
		const dLat = this.degreesToRadians(
			other.value.latitude.toPrimitive() - this.value.latitude.toPrimitive(),
		)
		const dLon = this.degreesToRadians(
			other.value.longitude.toPrimitive() - this.value.longitude.toPrimitive(),
		)

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(this.degreesToRadians(this.value.latitude.toPrimitive())) *
				Math.cos(this.degreesToRadians(other.value.latitude.toPrimitive())) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2)

		return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	}

	private degreesToRadians(degrees: number): number {
		return degrees * (Math.PI / 180)
	}

	toCoordinates(): { latitude: number; longitude: number } {
		return {
			latitude: this.value.latitude.toPrimitive(),
			longitude: this.value.longitude.toPrimitive(),
		}
	}

	toGeoJSON(): { type: 'Point'; coordinates: [number, number] } {
		return {
			type: 'Point',
			coordinates: [
				this.value.longitude.toPrimitive(),
				this.value.latitude.toPrimitive(),
			],
		}
	}
}
