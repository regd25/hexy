import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class StateValueObject extends StringValueObject {
	private static readonly STATE_REGEX = /^[A-Za-z\s]{2,50}$/

	constructor(value: string) {
		super(value.trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObjectError('Invalid state name')
		}
	}

	protected validate(value: string): boolean {
		return StateValueObject.STATE_REGEX.test(value)
	}
}
