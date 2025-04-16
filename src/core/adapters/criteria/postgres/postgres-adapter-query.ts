import type { Criteria } from 'core/port'

export interface PostgresAdapterQuery {
	fieldsToSelect: string[]
	tableName: string
	criteria: Criteria
	mappings: Record<string, string>
}
