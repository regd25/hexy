import { Module, ModuleDecorator, type ModuleOptions } from 'hexy/domain'
import { TaskModule } from './task/task-module'

/**
 * Main application module that combines all feature modules
 */
@ModuleDecorator({
	imports: [new TaskModule()],
	providers: [],
	exports: []
})
export class MainModule extends Module {
	constructor(options: ModuleOptions = { providers: [] }) {
		super(options);
	}
}
