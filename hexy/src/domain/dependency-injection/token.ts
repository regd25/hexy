/**
 * A token used to identify a dependency in the DI container.
 * Can be a class, string, symbol, or any other value.
 */
export type Token<T = any> = string | symbol | { new (...args: any[]): T }

/**
 * Creates a named token for dependency injection.
 * Useful for injecting values or interfaces that don't have a runtime representation.
 *
 * @example
 * const CONFIG_TOKEN = createToken<Config>('CONFIG');
 */
export function createToken<T>(name: string): Token<T> {
	return Symbol(name)
}
