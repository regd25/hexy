import { DataRecord, Primitive } from '@/shared/domain'

export interface PostgresConverterResult extends DataRecord {
	query: string
	params: Primitive[]
}
