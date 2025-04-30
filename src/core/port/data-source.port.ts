// import { Port } from '../decorators/port.decorator'; // Decorators cannot be applied to interfaces

import { Port } from 'core/decorators/port.decorator'
import type { DataRecord } from 'core/types'

/**
 * Represents a connection or access point to a data storage system.
 * Specific implementations will handle connection details.
 */
@Port({
	context: 'Core',
	description: 'Port representing a data source connection',
})
export abstract class DataSource {
	abstract fetch(query: DataRecord): Promise<DataRecord[]>
}
