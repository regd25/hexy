import {
	Module,
	ModuleDecorator,
	type Provider,
	type ModuleOptions,
} from 'hexy/domain'
import { TaskController } from './infrastructure/controllers/task-controller'
import { TaskRepository } from './domain'
import { InMemoryTaskRepository } from './infrastructure/repository/in-memory-task-repository'
import { TaskDomainService } from './domain'
import { TaskApplicationService } from './application/task-application-service'

/**
 * Main Task module that integrates all layers
 */
@ModuleDecorator({
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
			provide: TaskApplicationService,
			useClass: TaskApplicationService,
		},
		{ provide: TaskController, useClass: TaskController } as Provider<any>,
	],
	exports: [TaskController, TaskApplicationService],
})
export class TaskModule extends Module {
	constructor() {
		super({ providers: [] })
	}
}
