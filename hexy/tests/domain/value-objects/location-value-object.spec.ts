import { LocationValueObject } from '@/shared'

describe('LocationValueObject', () => {
	it('should create valid coordinates', () => {
		const validCoordinates = [
			{ lat: 19.4326077, lng: -99.1332079 }, // CDMX
			{ lat: 40.7127753, lng: -74.0059728 }, // NYC
			{ lat: 0, lng: 0 },
		]

		validCoordinates.forEach((coord) => {
			expect(() => new LocationValueObject(coord.lat, coord.lng)).not.toThrow()
		})
	})

	it('should throw error for invalid coordinates', () => {
		const invalidCoordinates = [
			{ lat: 91, lng: 0 },
			{ lat: -91, lng: 0 },
			{ lat: 0, lng: 181 },
			{ lat: 0, lng: -181 },
		]

		invalidCoordinates.forEach((coord) => {
			expect(() => new LocationValueObject(coord.lat, coord.lng)).toThrow(
				'Invalid geographic coordinates',
			)
		})
	})

	it('should calculate distance correctly', () => {
		const cdmx = new LocationValueObject(19.4326077, -99.1332079)
		const ny = new LocationValueObject(40.7127753, -74.0059728)

		const distance = cdmx.distanceTo(ny)
		expect(distance).toBeCloseTo(3420, 0) // ~3420 km
	})
})
