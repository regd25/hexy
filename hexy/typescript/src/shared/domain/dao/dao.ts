import { Entity } from '../aggregate/entity'
import { Criteria } from '../criteria'
import { Datasource } from '../datasource/datasource'
import { DataRecord } from '../types/data-record'
import { IdentifierValueObject } from '../value-objects'
import { DaoMapper } from './dao-mapper'

/**
 * @description Interface for a DAO
 * @template EntityType - The type of entity
 * @template IdentifierType - The type of identifier
 * @template RecordType - The type of record
 * @template CriteriaType - The type of criteria
 */
export interface Dao<
	EntityType extends Entity,
	IdentifierType extends IdentifierValueObject,
	RecordType extends DataRecord,
	CriteriaType extends Criteria,
> {
	mapper: DaoMapper<EntityType, RecordType>
	datasource: Datasource
	get(id: IdentifierType): Promise<EntityType | null>
	search(criteria: CriteriaType): Promise<EntityType[]>
	searchAll(): Promise<EntityType[]>
	create(entity: EntityType): Promise<EntityType>
	update(entity: EntityType): Promise<EntityType>
	delete(id: IdentifierType): Promise<void>
}
