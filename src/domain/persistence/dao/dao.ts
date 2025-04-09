import { Criteria } from '../../criteria'
import { DataRecord } from '../../types'
import { DataSource } from '../data-source/data-source'
import { StringValueObject, NumberIdValueObject } from '../../aggregate/value-objects'
/**
 * @description Interface for a DAO
 * @template DTO - The type of data transfer object
 * @template CriteriaType - The type of criteria
 */
export interface DAO<DTO extends DataRecord, CriteriaType extends Criteria> {
	datasource: DataSource
	table: string
	get(id: StringValueObject | NumberIdValueObject): Promise<DTO>
	search(criteria: CriteriaType): Promise<DTO[]>
	searchOne(criteria: CriteriaType): Promise<DTO>
	exists(criteria: CriteriaType): Promise<boolean>
	count(criteria: CriteriaType): Promise<number>
	searchAll(): Promise<DTO[]>
	create(entity: DTO): Promise<DTO>
	update(
		identity: StringValueObject | NumberIdValueObject,
		entity: DTO,
	): Promise<DTO>
	delete(id: StringValueObject | NumberIdValueObject): Promise<void>
}
