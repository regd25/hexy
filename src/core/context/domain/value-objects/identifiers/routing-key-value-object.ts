import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class RoutingKeyValueObject extends StringValueObject {
	private static readonly ROUTING_KEY_REGEX = /^[a-zA-Z0-9_\.\-]+$/

	constructor(value: string) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid routing key format')
		}
	}

	protected validate(value: string): boolean {
		return RoutingKeyValueObject.ROUTING_KEY_REGEX.test(value)
	}

	get components(): string[] {
		return this.value.split('.')
	}
}
