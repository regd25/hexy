import { PhoneNumberValueObject } from '@/shared'

describe('PhoneNumberValueObject', () => {
  it('should create valid phone numbers', () => {
    const validNumbers = [
      '+521234567890',
      '+34123456789',
      '+11234567890'
    ]

    validNumbers.forEach(number => {
      expect(() => new PhoneNumberValueObject(number)).not.toThrow()
    })
  })

  it('should throw error for invalid phone numbers', () => {
    const invalidNumbers = [
      '1234567890',
      '+abc123',
      '+12345',
      '+1234567890123456'
    ]

    invalidNumbers.forEach(number => {
      expect(() => new PhoneNumberValueObject(number)).toThrowError('Invalid phone number format')
    })
  })

  it('should format phone number correctly', () => {
    const mxPhone = new PhoneNumberValueObject('+521234567890')
    expect(mxPhone.toFormattedString()).toBe('+52 12 3456 7890')

    const usPhone = new PhoneNumberValueObject('+11234567890')
    expect(usPhone.toFormattedString()).toBe('+1 (123) 456-7890')
  })
}) 