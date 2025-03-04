import { InfrastructureModuleDecorator, Module } from 'hexy'
import { TaskRepository } from '../domain/aggregate/task-repository'
import { InMemoryTaskRepository } from './repository/in-memory-task-repository'

// Crear un símbolo para la inyección de dependencias
export const TASK_REPOSITORY = Symbol('TaskRepository')

/**
 * Module for Task infrastructure components
 */
@InfrastructureModuleDecorator({
	providers: [
		{
			provide: TASK_REPOSITORY,
			useClass: InMemoryTaskRepository,
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
			],
			exports: [TASK_REPOSITORY],
		})
	}
}
