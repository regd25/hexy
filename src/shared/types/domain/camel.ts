/**
 * Utility type that converts snake_case string to camelCase
 */
type SnakeToCamelCase<S extends string> = S extends `${infer P}_${infer Q}`
	? `${P}${Capitalize<SnakeToCamelCase<Q>>}`
	: S

/**
 * Converts all keys in an object from snake_case to camelCase
 */
export type Camel<T> = T extends object
	? {
			[K in keyof T as SnakeToCamelCase<K & string>]: T[K] extends object
				? Camel<T[K]>
				: T[K]
		}
	: T
