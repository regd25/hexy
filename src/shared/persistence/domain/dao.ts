import { Criteria } from 'shared/criteria'
import type { DataRecord } from 'shared/types'
import type { StringValueObject, NumberIdValueObject } from 'shared/core'
import type { DataSource } from './data-source'
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
