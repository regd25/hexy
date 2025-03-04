import { Module, ModuleDecorator } from 'hexy'
import { TaskApplicationService } from './application/task-application-service'
import { TaskApplicationModule } from './application/task-application-module'

/**
 * Main Task module that integrates all layers
 */
@ModuleDecorator({
	imports: [new TaskApplicationModule()],
	providers: [],
	exports: [TaskApplicationService],
})
export class TaskModule extends Module {
	constructor() {
		super({
			imports: [new TaskApplicationModule()],
			providers: [],
			exports: [TaskApplicationService],
		})
	}
}
