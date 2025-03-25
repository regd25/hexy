import { EmailValueObject } from 'hexy/domain'

describe('EmailValueObject', () => {
	it('should create valid email', () => {
		const validEmails = [
			'test@example.com',
			'user.name+tag@sub.domain.co',
			'user_name@domain.org',
		]

		validEmails.forEach((email) => {
			expect(() => new EmailValueObject(email)).not.toThrow()
		})
	})

	it('should throw error for invalid email', () => {
		const invalidEmails = ['invalid', 'user@.com', '@domain.com', 'user@domain']

		invalidEmails.forEach((email) => {
			expect(() => new EmailValueObject(email)).toThrowError(
				'Invalid email format',
			)
		})
	})

	it('should return correct parts', () => {
		const email = new EmailValueObject('john.doe+test@example.com')
		expect(email.localPart).toBe('john.doe+test')
		expect(email.domain).toBe('example.com')
	})
})
