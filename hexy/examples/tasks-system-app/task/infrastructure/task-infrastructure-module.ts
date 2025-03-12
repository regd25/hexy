import { InfrastructureModule, Module } from 'hexy'
import { InMemoryTaskRepository } from './repository/in-memory-task-repository'
import { TaskController } from './controllers/task-controller'

// Create a symbol for dependency injection
export const TASK_REPOSITORY = Symbol('TaskRepository')

/**
 * Module for Task infrastructure components
 */
@InfrastructureModule({
	providers: [
		{
			provide: TASK_REPOSITORY,
			useClass: InMemoryTaskRepository,
		},
		{
			provide: TaskController,
			useClass: TaskController,
		},
	],
	exports: [TASK_REPOSITORY],
})
export class TaskInfrastructureModule extends Module {
	constructor() {
		super({
			providers: [
				{
					provide: TASK_REPOSITORY,
					useClass: InMemoryTaskRepository,
				},
				{
					provide: TaskController,
					useClass: TaskController,
				},
			],
			exports: [TASK_REPOSITORY],
		})
	}
}
