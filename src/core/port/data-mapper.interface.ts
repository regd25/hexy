/**
 * Generic interface for data mapping operations.
 * @template T - The input type.
 * @template U - The output type.
 */
export interface DataMapper<T, U> {
	/**
	 * Maps an input object to an output object.
	 * @param input - The input object to map.
	 * @returns The mapped output object.
	 */
	map(input: T): U
}
