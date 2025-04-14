import type { StringRecord } from 'src/core/types'
import type { PostgresAdapterResult } from './postgres-adapter-result'
import type {
	CriteriaAdapter,
	CriteriaAdapterQuery,
	FilterPrimitives,
} from 'src/core/criteria'

/**
 * Class that converts a domain Criteria into a parameterized PostgreSQL query.
 *
 * This converter follows the Domain Driven Design and Hexagonal Architecture
 * principles, transforming a Criteria instance into a SQL query that uses PostgreSQL placeholders.
 */
export class PostgresCriteriaAdapter implements CriteriaAdapter {
	/**
	 * Converts the domain Criteria to a PostgreSQL query.
	 *
	 * @param fieldsToSelect - Array of fields to select.
	 * @param tableName - Name of the database table.
	 * @param criteria - Domain Criteria object containing filters, order, limit and offset.
	 * @param mappings - (Optional) Mapping from domain field names to database column names.
	 * @returns An object containing the query string and an array of parameters.
	 */
	adapt(_query: CriteriaAdapterQuery): PostgresAdapterResult {
		const { fieldsToSelect, tableName, criteria, mappings } = _query
		let query = `SELECT ${fieldsToSelect.join(', ')} FROM ${tableName}`
		const params: (string | number)[] = []
		let paramIndex = 1

		const criteriaData = criteria.toPrimitive()
		const { filters, order, limit, offset } = criteriaData

		if (filters && !filters.isEmpty()) {
			const conditions: string[] = []
			const filterPrimitives: FilterPrimitives[] = filters.toPrimitives()

			for (const filter of filterPrimitives) {
				const condition = this.toWhereQuery(
					filter,
					mappings,
					params,
					paramIndex,
				)
				conditions.push(condition)
				paramIndex++
			}
			query += ' WHERE ' + conditions.join(' AND ')
		}

		if (order && order.hasOrder && order.hasOrder()) {
			const orderPrimitives = order.toPrimitives()
			if (orderPrimitives.orderBy) {
				query += ` ORDER BY ${orderPrimitives.orderBy} ${orderPrimitives.orderType}`
			}
		}

		if (typeof limit === 'number') {
			query += ` LIMIT $${paramIndex}`
			params.push(limit)
			paramIndex++
		}

		if (typeof offset === 'number') {
			query += ` OFFSET $${paramIndex}`
			params.push(offset)
			paramIndex++
		}

		return { query: query + ';', params }
	}

	/**
	 * Generates a parameterized WHERE clause condition for the given filter.
	 *
	 * @param filter - Filter object containing field, operator, and value.
	 * @param mappings - (Optional) Mapping from domain field names to database column names.
	 * @param params - Array of parameters that will be used in the query.
	 * @param paramIndex - Current placeholder index for PostgreSQL.
	 * @returns A string representing the condition to be added to the WHERE clause.
	 */
	private toWhereQuery(
		filter: FilterPrimitives,
		mappings: StringRecord,
		params: (string | number)[],
		paramIndex: number,
	): string {
		const field = mappings[filter.field] || filter.field

		let sqlOperator: string
		switch (filter.operator) {
			case '=':
				sqlOperator = '='
				break
			case '!=':
				sqlOperator = '<>'
				break
			case '>':
				sqlOperator = '>'
				break
			case '<':
				sqlOperator = '<'
				break
			case 'CONTAINS':
				sqlOperator = 'ILIKE'
				break
			case 'NOT_CONTAINS':
				sqlOperator = 'NOT ILIKE'
				break
			default:
				sqlOperator = filter.operator
		}

		if (filter.operator === 'CONTAINS' || filter.operator === 'NOT_CONTAINS') {
			params.push(`%${filter.value}%`)
		} else {
			switch (typeof filter.value) {
				case 'string':
					params.push(filter.value)
					break
				case 'number':
					params.push(filter.value)
					break
				case 'boolean':
					params.push(filter.value ? 'TRUE' : 'FALSE')
					break
				case 'object':
					if (filter.value === null) {
						params.push('NULL')
					} else {
						throw new Error('Unsupported value type')
					}
					break
				case 'undefined':
					params.push('NULL')
					break
			}
		}
		return `${field} ${sqlOperator} $${paramIndex}`
	}
}
