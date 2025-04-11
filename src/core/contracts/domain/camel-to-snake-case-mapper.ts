import type { DataRecord, Snaked } from 'src/core/types'
import type { Mapper } from 'src/core/contracts'

/**
 * @description Abstract class for mapping camelCase records to snake_case records and vice versa
 * @template From - The type of record
 * @template To - The type of record
 */
export abstract class CamelToSnakeCaseMapper<
	From extends DataRecord,
	To extends Snaked<From> = Snaked<From>,
> implements Mapper<From, To>
{
	/**
	 * @description Converts a snake_case record to an entity
	 * @param record - The record to convert
	 * @returns The entity
	 */
	from(entity: From): To {
		return this.convertToSnakeCase(entity)
	}

	/**
	 * @description Converts an entity to a snake_case record
	 * @param entity - The entity to convert
	 * @returns The record
	 */
	to(to: To): From {
		return this.convertToCamelCase(to)
	}

	/**
	 * @description Converts an object with camelCase keys to snake_case keys
	 * @param obj - The object to convert
	 * @returns The object with snake_case keys
	 * @param {boolean} recursive - Whether to recursively convert the object
	 */
	protected convertToSnakeCase(
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
				result[snakeKey] = recursive
					? this.convertToSnakeCase(value as DataRecord)
					: value
			} else if (Array.isArray(value)) {
				result[snakeKey] = value.map((item) =>
					typeof item === 'object' && item !== null
						? this.convertToSnakeCase(item as DataRecord)
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
	protected camelToSnakeCase(str: string): string {
		return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
	}

	/**
	 * @description Converts a snake_case string to camelCase
	 * @param str - The string to convert
	 * @returns The camelCase string
	 */
	protected snakeToCamelCase(str: string): string {
		return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
	}

	/**
	 * @description Converts an object with snake_case keys to camelCase keys
	 * @param obj - The object to convert
	 * @returns The object with camelCase keys
	 */
	protected convertToCamelCase(obj: To): From {
		const result: Record<string, unknown> = {}

		for (const [key, value] of Object.entries(obj)) {
			const camelKey = this.snakeToCamelCase(key)

			if (
				value !== null &&
				typeof value === 'object' &&
				!Array.isArray(value)
			) {
				result[camelKey] = this.convertToCamelCase(value as To)
			} else if (Array.isArray(value)) {
				result[camelKey] = value.map((item) =>
					typeof item === 'object' && item !== null
						? this.convertToCamelCase(item as To)
						: item,
				)
			} else {
				result[camelKey] = value
			}
		}

		return result as From
	}
}
