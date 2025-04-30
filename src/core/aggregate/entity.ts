import type { DataRecord } from '../types'
import type { Identifier } from './value-object'

export abstract class Entity {
	abstract id: Identifier

	abstract toPrimitives(): DataRecord

	static fromPrimitives(primitives: DataRecord): Entity {
		throw new Error('Not implemented')
	}
}
