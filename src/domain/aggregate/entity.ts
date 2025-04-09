import { DataRecord } from '../types'
import { IdentifierValueObject } from './value-objects'

export abstract class Entity {
	abstract id: IdentifierValueObject

	abstract toPrimitives(): DataRecord

	static fromPrimitives(primitives: DataRecord): Entity {
		throw new Error('Not implemented')
	}
}
