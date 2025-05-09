import type { DataRecord, Primitive } from '@/types'

export interface PostgresAdapterResult extends DataRecord {
	query: string
	params: Primitive[]
}
