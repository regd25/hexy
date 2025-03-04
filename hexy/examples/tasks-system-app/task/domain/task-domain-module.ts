import { DomainModuleDecorator, Module } from 'hexy'
import { TaskDomainService } from './service/task-domain-service'

/**
 * Module for Task domain components
 */
@DomainModuleDecorator({
	providers: [
		{
			provide: TaskDomainService,
			useClass: TaskDomainService,
		},
	],
	exports: [TaskDomainService],
})
export class TaskDomainModule extends Module {
	constructor() {
		super({
			providers: [
				{
					provide: TaskDomainService,
					useClass: TaskDomainService,
				},
			],
			exports: [TaskDomainService],
		})
	}
}
