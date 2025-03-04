import { AbstractEntity } from '../../aggregate'
import { Criteria } from '../../criteria'
import { DataSource } from '../data-source/data-source'
import { DataRecord } from '../../types/data-record'
import { Mapper } from '../mappers'
/**
 * @description Interface for a DAO
 * @template EntityType - The type of entity
 * @template RecordType - The type of record
 * @template CriteriaType - The type of criteria
 */
export interface Dao<
	EntityType extends AbstractEntity,
	RecordType extends DataRecord,
	CriteriaType extends Criteria,
> {
	mapper: Mapper<RecordType, RecordType>
	datasource: DataSource
	table: string
	get(id: EntityType['id']): Promise<EntityType | null>
	search(criteria: CriteriaType): Promise<EntityType[]>
	searchOne(criteria: CriteriaType): Promise<EntityType | null>
	exists(criteria: CriteriaType): Promise<boolean>
	count(criteria: CriteriaType): Promise<number>
	searchAll(): Promise<EntityType[]>
	create(entity: EntityType): Promise<EntityType>
	update(identity: EntityType['id'], entity: EntityType): Promise<EntityType>
	delete(id: EntityType['id']): Promise<void>
}
