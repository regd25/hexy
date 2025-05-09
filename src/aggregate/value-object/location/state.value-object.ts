import { PrimitiveValueObject } from '../primitive-value-object'
import { InvalidLocation } from './error/invalid-location.error'

export class State extends PrimitiveValueObject<string> {
	private static readonly STATE_REGEX = /^[A-Za-z\s]{2,50}$/

	constructor(value: string) {
		super(value.trim())
		if (!this.validate(this.value)) {
			throw new InvalidLocation(this)
		}
	}

	protected validate(value: string): boolean {
		return State.STATE_REGEX.test(value)
	}
}
