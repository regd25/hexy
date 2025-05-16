import { ValueObject } from '../value-object'
import { InvalidMonetary } from './error/invalid-monetary.error'

/**
 * @description A value object that represents an amount of money.
 * @example
 * const amount = new Amount(100)
 */
export class Amount extends ValueObject<number> {
	/**
	 * @description Creates a new Amount instance.
	 * @param value - The amount of money.
	 */
	constructor(value: number) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidMonetary(this)
		}
	}

	protected validate(value: number): boolean {
		return value >= 0
	}
}
