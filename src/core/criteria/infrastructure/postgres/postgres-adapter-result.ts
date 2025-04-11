import type { DataRecord, Primitive } from 'src/core/types'

export interface PostgresAdapterResult extends DataRecord {
	query: string
	params: Primitive[]
}
