import type { DataRecord } from 'src/core/types'
import type { Client } from 'pg'
import type { DataSource } from 'src/core/persistence/domain/data-source'
import {
	PostgresCriteriaAdapter,
	type PostgresAdapterResult,
} from 'src/core/criteria'

/**
 * @description Postgres datasource implementation
 */
export class PostgresDataSource implements DataSource {
	/**
	 * @description Adapter to convert criteria to postgres query
	 */
	protected readonly adapter = new PostgresCriteriaAdapter()

	/**
	 * @description Postgres client
	 * @param client - Postgres client
	 */
	constructor(private readonly client: Client) {}

	/**
	 * @description Fetch data from postgres
	 * @param query - Postgres query
	 * @returns Data from postgres
	 */
	async fetch<RecordType extends DataRecord>(
		query: PostgresAdapterResult,
	): Promise<RecordType[]> {
		const result = await this.client.query<RecordType>(
			query.query,
			query.params,
		)
		return result.rows
	}

	/**
	 * @description transaction
	 * @param callback - Callback to execute in the transaction
	 * @returns Data from postgres
	 */
	async transaction<RecordType extends DataRecord>(
		callback: (client: Client) => Promise<RecordType[]>,
	): Promise<RecordType[]> {
		try {
			await this.client.query('BEGIN')
			const result = await callback(this.client)
			await this.client.query('COMMIT')
			return result
		} catch (error) {
			await this.client.query('ROLLBACK')
			throw error
		}
	}

	/**
	 * @description Close the connection
	 */
	async close(): Promise<void> {
		await this.client.end()
	}

	/**
	 * @description Get the client
	 * @returns Client
	 */
	getClient(): Client {
		return this.client
	}

	/**
	 * @description Connect to the database
	 * @returns Client
	 */
	async connect(): Promise<void> {
		await this.client.connect()
	}
}
