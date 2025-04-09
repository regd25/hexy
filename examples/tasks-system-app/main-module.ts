import { Module, ModuleClass } from '@hexy'
import { TaskModule } from './task/task-module'

/**
 * Main application module that combines all feature modules
 */
@Module({
	imports: [new TaskModule()],
	providers: [],
	exports: [],
})
export class MainModule extends ModuleClass {
	constructor(options = { providers: [] }) {
		super(options)
	}
}
