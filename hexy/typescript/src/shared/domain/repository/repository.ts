import { AggregateRoot } from '../aggregate/aggregate-root'
import { Criteria } from '../criteria'

/**
 * @description Repository interface
 * @template AggregateType - The type of aggregate root
 * @template CriteriaType - The type of criteria
 */
export interface Repository<
	AggregateType extends AggregateRoot = AggregateRoot,
	CriteriaType extends Criteria = Criteria,
> {
	search(criteria: CriteriaType): Promise<AggregateType[]>
	searchAll(): Promise<AggregateType[]>
	save(entity: AggregateType): Promise<AggregateType>
}
