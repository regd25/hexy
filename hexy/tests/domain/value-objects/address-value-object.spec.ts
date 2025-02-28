import { AddressValueObject } from '@/shared/domain/value-objects/address/address-value-object'
import { StreetValueObject } from '@/shared/domain/value-objects/address/street-value-object'
import { CityValueObject } from '@/shared/domain/value-objects/address/city-value-object'
import { StateValueObject } from '@/shared/domain/value-objects/address/state-value-object'
import { CountryValueObject } from '@/shared/domain/value-objects/location/country-value-object'
import { ZipCodeValueObject } from '@/shared/domain/value-objects/address/zip-code-value-object'

describe('AddressValueObject', () => {
  it('should create valid address', () => {
    const address = new AddressValueObject({
      street: new StreetValueObject('123 Main St'),
      city: new CityValueObject('New York'),
      state: new StateValueObject('NY'),
      country: new CountryValueObject('US'),
      zipCode: new ZipCodeValueObject('10001', 'US')
    })

    expect(address.fullAddress).toContain('123 Main St')
    expect(address.fullAddress).toContain('New York')
    expect(address.fullAddress).toContain('NY')
    expect(address.fullAddress).toContain('United States')
    expect(address.fullAddress).toContain('10001')
  })

  it('should throw error for invalid components', () => {
    expect(() => new AddressValueObject({
      street: new StreetValueObject(''),
      city: new CityValueObject('New York'),
      state: new StateValueObject('NY'),
      country: new CountryValueObject('US'),
      zipCode: new ZipCodeValueObject('10001', 'US')
    })).toThrowError('Street complement too long')
  })
}) 