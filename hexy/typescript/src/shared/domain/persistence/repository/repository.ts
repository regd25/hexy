import { AggregateRoot } from '../../aggregate'
import { Criteria } from '../../criteria'

/**
 * @description Repository interface
 * @template AggregateType - The type of aggregate root
 * @template CriteriaType - The type of criteria
 */
export interface CRUDRepository<
	AggregateType extends AggregateRoot = AggregateRoot,
> {
	searchAll(): Promise<AggregateType[]>
	save(entity: AggregateType): Promise<AggregateType>
	search(criteria: Criteria): Promise<AggregateType[]>
	searchById(id: string): Promise<AggregateType | null>
	delete(id: string): Promise<void>
}
