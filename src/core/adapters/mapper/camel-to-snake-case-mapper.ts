import type { DataRecord, Snaked } from 'core/types'
import type { DataMapper } from 'core/port'

/**
 * @description Abstract class for mapping camelCase records to snake_case records and vice versa
 * @template From - The type of record
 * @template To - The type of record
 */
export class CamelToSnakeCaseMapper<
	From extends DataRecord,
	To extends Snaked<From> = Snaked<From>,
> implements DataMapper<From, To>
{
	/**
	 * @description Converts an entity to a snake_case record
	 * @param entity - The entity to convert
	 * @returns The record
	 */
	map(input: From): To {
		return this.convertToSnakeCase(input)
	}

	/**
	 * @description Converts an object with camelCase keys to snake_case keys
	 * @param obj - The object to convert
	 * @returns The object with snake_case keys
	 * @param {boolean} recursive - Whether to recursively convert the object
	 */
	private convertToSnakeCase(
		obj: DataRecord,
		{ recursive = true }: { recursive?: boolean } = {},
	): To {
		const result: Record<string, unknown> = {}

		for (const [key, value] of Object.entries(obj)) {
			const snakeKey = this.camelToSnakeCase(key)

			if (
				value !== null &&
				typeof value === 'object' &&
				!Array.isArray(value)
			) {
				result[snakeKey] = recursive ? this.convertToSnakeCase(value) : value
			} else if (Array.isArray(value)) {
				result[snakeKey] = value.map((item) =>
					typeof item === 'object' && item !== null
						? this.convertToSnakeCase(item)
						: item,
				)
			} else {
				result[snakeKey] = value
			}
		}

		return result as To
	}

	/**
	 * @description Converts a camelCase string to snake_case
	 * @param str - The string to convert
	 * @returns The snake_case string
	 */
	private camelToSnakeCase(str: string): string {
		return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
	}
}
