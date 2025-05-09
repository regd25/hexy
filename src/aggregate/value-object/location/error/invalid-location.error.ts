import { DomainError } from '@/error'
import type { Class } from '@/types'

export class InvalidLocation extends DomainError {
	constructor(location: Class, payload: Record<string, string>) {
		let message = 'Invalid location'

		switch (location.name) {
			case 'Street':
				message = `Invalid street ${payload['street']}`
				break
			case 'City':
				message = `Invalid city ${payload['city']}`
				break
			case 'State':
				message = `Invalid state ${payload['state']}`
				break
			case 'ZipCode':
				message = `Invalid zip code ${payload['zipCode']}`
				break
			case 'Point':
				message = `Invalid point ${payload['point']}`
				break
			case 'Country':
				message = `Invalid country ${payload['country']}`
				break
			case 'Address':
				message = `Invalid address ${payload['address']}`
				break
			case 'Longitude':
				message = `Invalid longitude ${payload['longitude']}`
				break
			case 'Latitude':
				message = `Invalid latitude ${payload['latitude']}`
				break
			default:
				message = `Invalid location`
				break
		}
		super({ message })
	}

	getMessage(): string {
		return this.message
	}
}
