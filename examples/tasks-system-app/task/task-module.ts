import { Module, ModuleClass } from 'src/core/di'
import { TaskController } from './infrastructure/controllers/task-controller'
import { TaskDomainService, TaskRepository } from './domain'
import { InMemoryTaskRepository } from './infrastructure/repository/in-memory-task-repository'
import { TaskApplicationService } from './application/task-application-service'
import { TASK_APPLICATION_SERVICE } from './application/tokens'

/**
 * Main Task module that integrates all layers
 */
@Module({
	providers: [
		{
			provide: TaskRepository,
			useClass: InMemoryTaskRepository,
		},
		{
			provide: TaskDomainService,
			useClass: TaskDomainService,
		},
		{
			provide: TASK_APPLICATION_SERVICE,
			useClass: TaskApplicationService,
		},
		{ provide: TaskController, useClass: TaskController },
	],
	exports: [
		TASK_APPLICATION_SERVICE,
		TaskController,
		TaskApplicationService,
		TaskDomainService,
		TaskRepository,
	],
})
export class TaskModule extends ModuleClass {
	constructor(options = { providers: [] }) {
		super(options)
	}
}
