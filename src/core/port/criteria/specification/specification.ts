import type { AggregateRoot, Entity } from 'core/aggregate'

/**
 * @description Abstract class for a specification
 */
export abstract class Specification {
	/**
	 * @description Checks if the specification is satisfied by the entity
	 * @param entity - The = to check
	 * @returns True if the specification is satisfied, false otherwise
	 */
	abstract isSatisfiedBy<T extends Entity | AggregateRoot>(entity: T): boolean

	/**
	 * @description Combines the specification with another specification
	 * @param specification - The specification to combine with
	 * @returns A new specification that is the combination of the two
	 */
	abstract and(specification: Specification): Specification

	/**
	 * @description Combines the specification with another specification
	 * @param specification - The specification to combine with
	 * @returns A new specification that is the combination of the two
	 */
	abstract or(specification: Specification): Specification

	/**
	 * @description Negates the specification
	 * @returns A new specification that is the negation of the current specification
	 */
	abstract not(): Specification

	/**
	 * @description Combines the specification with another specification
	 * @param specification - The specification to combine with
	 * @returns A new specification that is the combination of the two
	 */
	abstract xor(specification: Specification): Specification
}
