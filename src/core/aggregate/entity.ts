import type { DataRecord } from 'src/core/types'
import type { IdentifierValueObject } from './value-object'

export abstract class Entity {
	abstract id: IdentifierValueObject

	abstract toPrimitives(): DataRecord

	static fromPrimitives(primitives: DataRecord): Entity {
		throw new Error('Not implemented')
	}
}
