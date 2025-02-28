import { AggregateRoot } from '../../aggregate'
import { Criteria } from '../../criteria'
import { IdentifierValueObject } from '../../value-objects'

/**
 * @description Repository interface
 * @template AggregateType - The type of aggregate root
 * @template CriteriaType - The type of criteria
 */

export abstract class Repository<T extends AggregateRoot> {
  abstract save(aggregate: T): Promise<void>
  abstract findById(id: IdentifierValueObject): Promise<T | null>
  abstract findAll(): Promise<T[]>
  abstract matching(criteria: Criteria): Promise<T[]>
  abstract delete(id: IdentifierValueObject): Promise<void>
  abstract count(criteria?: Criteria): Promise<number>
  abstract exists(id: IdentifierValueObject): Promise<boolean>
}