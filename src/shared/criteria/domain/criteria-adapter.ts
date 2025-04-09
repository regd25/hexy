import type { StringRecord } from 'shared/types'
import type { PostgresAdapterResult } from '../infrastructure/postgres/postgres-adapter-result'
import type { Criteria } from './criteria/criteria'
import type { Adapter } from 'shared/contracts'

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
