import { DataRecord } from '../../types'

/**
 * @description Interface for a datasource that can fetch records from a database
 */
export interface Datasource {
	fetch(query: DataRecord): Promise<DataRecord[]>
}
