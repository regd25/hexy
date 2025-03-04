import { UuidValueObject } from '@/shared'

describe('UuidValueObject', () => {
	it('should create valid UUID', () => {
		const validUUIDs = [
			'f47ac10b-58cc-4372-a567-0e02b2c3d479',
			'F47AC10B-58CC-4372-A567-0E02B2C3D479',
			'00000000-0000-4000-8000-000000000000',
		]

		validUUIDs.forEach((uuid) => {
			expect(() => new UuidValueObject(uuid)).not.toThrow()
		})
	})

	it('should throw error for invalid UUID', () => {
		const invalidUUIDs = [
			'invalid-uuid',
			'f47ac10b58cc4372a5670e02b2c3d479',
			'f47ac10b-58cc-0372-a567-0e02b2c3d479',
		]

		invalidUUIDs.forEach((uuid) => {
			expect(() => new UuidValueObject(uuid)).toThrowError(
				'Invalid UUID format',
			)
		})
	})

	it('should generate valid UUID', () => {
		const uuid = UuidValueObject.generate()
		expect(() => new UuidValueObject(uuid.toString())).not.toThrow()
	})
})
