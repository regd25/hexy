import type { StringRecord } from 'src/core/types'
import type { PostgresAdapterResult } from '../infrastructure/postgres/postgres-adapter-result'
import type { Criteria } from './criteria/criteria'
import type { Adapter } from 'src/core/contracts'

export type CriteriaAdapterQuery = {
	fieldsToSelect: string[]
	tableName: string
	criteria: Criteria
	mappings: StringRecord
}

export abstract class CriteriaAdapter
	implements Adapter<CriteriaAdapterQuery, PostgresAdapterResult>
{
	abstract adapt(query: CriteriaAdapterQuery): PostgresAdapterResult
}
