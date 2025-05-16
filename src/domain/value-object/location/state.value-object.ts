import { ValueObject } from '../value-object'
import { InvalidLocation } from './error/invalid-location.error'

export class State extends ValueObject<string> {
	private static readonly STATE_REGEX = /^[A-Za-z\s]{2,50}$/

	constructor(value: string) {
		super(value.trim())
		if (!this.validate(this.value)) {
			throw new InvalidLocation(State, { state: this.value })
		}
	}

	validate(value: string): boolean {
		return State.STATE_REGEX.test(value)
	}
}
