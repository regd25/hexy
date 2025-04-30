import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

export class State extends ValueObject<string> {
	private static readonly STATE_REGEX = /^[A-Za-z\s]{2,50}$/

	constructor(value: string) {
		super(value.trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObject('Invalid state name')
		}
	}

	protected validate(value: string): boolean {
		return State.STATE_REGEX.test(value)
	}
}
