import { DateValueObject, DateRangeValueObject } from 'hexy/domain'

describe('DateRangeValueObject', () => {
	it('should create valid date range', () => {
		const start = new DateValueObject('2024-01-01')
		const end = new DateValueObject('2024-01-31')

		expect(() => new DateRangeValueObject(start, end)).not.toThrow()
	})

	it('should throw error for inverted dates', () => {
		const start = new DateValueObject('2024-01-31')
		const end = new DateValueObject('2024-01-01')

		expect(() => new DateRangeValueObject(start, end)).toThrowError(
			'Start date must be before end date',
		)
	})

	it('should calculate duration correctly', () => {
		const start = new DateValueObject('2024-01-01')
		const end = new DateValueObject('2024-01-10')
		const range = new DateRangeValueObject(start, end)

		expect(range.durationInDays()).toBe(9)
	})
})
