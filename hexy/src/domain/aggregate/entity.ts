import { DataRecord } from '../types'
import { IdentifierValueObject } from '../value-objects'

export abstract class AbstractEntity {
	abstract id: IdentifierValueObject

	abstract toPrimitives(): DataRecord

	static fromPrimitives(primitives: DataRecord): AbstractEntity {
		throw new Error('Not implemented')
	}
} 