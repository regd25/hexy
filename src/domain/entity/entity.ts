import type { DataRecord } from '../../types'
import type { Identifier } from '../value-object'

/**
 * Base class for all entities
 * @description This class is used to create entities that are immutable and comparable
 */
export interface Entity {
	id: Identifier
	toPrimitives(): DataRecord
}
