import { getModuleFromClass, Module, ModuleClass } from 'src/core/di'
import { TaskModule } from './task/task-module'

const taskModule = getModuleFromClass(TaskModule)

if (!taskModule) {
	throw new Error('TaskModule not found')
}

/**
 * Main application module that combines all feature modules
 */
@Module({
	imports: [taskModule],
	providers: [],
	exports: [],
})
export class MainModule extends ModuleClass {
	constructor(options = { providers: [] }) {
		super(options)
	}
}

