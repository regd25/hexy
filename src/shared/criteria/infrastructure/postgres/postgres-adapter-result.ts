import type { DataRecord, Primitive } from 'shared/types'

export interface PostgresAdapterResult extends DataRecord {
	query: string
	params: Primitive[]
}
