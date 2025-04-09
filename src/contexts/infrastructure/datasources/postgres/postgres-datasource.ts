import { PostgresCriteriaConverter } from './postgres-criteria-converter'
import { DataSource } from '../../../../domain/persistence'
import { PostgresConverterResult } from './postgres-converter-result'
import { Client } from 'pg'
import { DataRecord } from '../../../../domain'

/**
 * @description Postgres datasource implementation
 */
export class PostgresDatasource implements DataSource {
	/**
	 * @description Converter to convert criteria to postgres query
	 */
	protected readonly converter = new PostgresCriteriaConverter()

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
		query: PostgresConverterResult,
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
