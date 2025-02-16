import { Entity } from '../aggregate/entity'
import { DataRecord } from '../types/data-record'

/**
 * @description Interface for a DAO mapper
 * @template EntityType - The type of entity
 * @template RecordType - The type of record
 */
export interface DaoMapper<
	EntityType extends Entity,
	RecordType extends DataRecord,
> {
	fromRecord(record: RecordType): EntityType
	toRecord(entity: EntityType): RecordType
}
