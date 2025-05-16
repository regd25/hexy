import { InvalidIdentifier } from './error/invalid-identifier.error'
import { ValueObject } from '../value-object'

/**
 * @description A value object that represents a routing key.
 * @example
 * const routingKey = new RoutingKey('user.create', '.')
 */
export class RoutingKey extends ValueObject<string> {
	private static readonly ROUTING_KEY_REGEX = /^[a-zA-Z0-9_\.\-]+$/

	/**
	 * @description Creates a new RoutingKey instance.
	 * @param value - The routing key.
	 * @param separator - The separator of the routing key.
	 */
	constructor(
		value: string,
		private readonly separator: string = '.',
	) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidIdentifier(RoutingKey, {
				routingKey: this.value,
				separator: this.separator,
			})
		}
	}

	validate(value: string): boolean {
		return RoutingKey.ROUTING_KEY_REGEX.test(value)
	}

	/**
	 * @description Gets the components of the routing key.
	 * @returns The components of the routing key.
	 */
	get components(): string[] {
		return this.value.split(this.separator)
	}
}
