/**
 * A proper class for injection tokens with type safety
 * @typeparam T - The type that this token will resolve to
 */
export class InjectionToken<T = any> {
	/**
	 * Unique symbol for this token
	 */
	private readonly _id: symbol

	/**
	 * Creates a new injection token
	 * @param description - A description of what this token represents
	 */
	constructor(public readonly description: string) {
		this._id = Symbol(description)
	}

	/**
	 * Returns a string representation of this token
	 */
	toString(): string {
		return `InjectionToken[${this.description}]`
	}

	/**
	 * Makes the token comparable by its internal symbol
	 */
	[Symbol.toPrimitive](): symbol {
		return this._id
	}
}

/**
 * A token used to identify a dependency in the DI container.
 * Can be a class, string, symbol, InjectionToken, or any other value.
 */
export type Token<T = any> =
	| string
	| symbol
	| InjectionToken<T>
	| { new (...args: any[]): T }

/**
 * Creates a named token for dependency injection.
 * Uses the new InjectionToken class for better type safety.
 *
 * @example
 * const CONFIG_TOKEN = createToken<Config>('CONFIG');
 */
export function createToken<T>(name: string): InjectionToken<T> {
	return new InjectionToken<T>(name)
}
