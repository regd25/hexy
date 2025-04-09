import { DataRecord, Primitive } from '../../../../domain'

export interface PostgresConverterResult extends DataRecord {
	query: string
	params: Primitive[]
}
