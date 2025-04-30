import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

export class Amount extends ValueObject<number> {
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject(`Invalid value for amount value object`)
		}
	}

	protected validate(value: number): boolean {
		return value >= 0
	}
}
