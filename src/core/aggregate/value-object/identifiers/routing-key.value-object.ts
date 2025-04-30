import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

export class RoutingKey extends ValueObject<string> {
	private static readonly ROUTING_KEY_REGEX = /^[a-zA-Z0-9_\.\-]+$/

	constructor(value: string) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObject('Invalid routing key format')
		}
	}

	protected validate(value: string): boolean {
		return RoutingKey.ROUTING_KEY_REGEX.test(value)
	}

	get components(): string[] {
		return this.value.split('.')
	}
}
