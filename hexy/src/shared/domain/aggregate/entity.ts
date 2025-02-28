import { DataRecord } from '../types'
import { IdentifierValueObject } from '../value-objects'

export abstract class Entity {
	abstract id: IdentifierValueObject

	abstract toPrimitives(): DataRecord

	abstract fromPrimitives(primitives: DataRecord): Entity
}
