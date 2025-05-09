import type { Criteria } from '@/port'

export interface PostgresAdapterQuery {
	fieldsToSelect: string[]
	tableName: string
	criteria: Criteria
	mappings: Record<string, string>
}
