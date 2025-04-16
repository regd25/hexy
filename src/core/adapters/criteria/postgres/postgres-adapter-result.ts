import type { DataRecord, Primitive } from 'core/types'

export interface PostgresAdapterResult extends DataRecord {
	query: string
	params: Primitive[]
}
