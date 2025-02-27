import { DataRecord } from '../../types/data-record'

/**
 * @description Interface for a Mapper
 * @template FromRecord - The type of record
 * @template ToRecord - The type of record
 */
export interface Mapper<From extends DataRecord, To extends DataRecord> {
	from(from: From): To
	to(to: To): From
}
