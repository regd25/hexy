import { ApplicationModule, Module } from 'hexy'
import { TaskApplicationService } from './task-application-service'
import { TaskDomainModule } from '../domain'
import { TaskInfrastructureModule } from '../infrastructure/task-infrastructure-module'

/**
 * Application module for Task features
 */
@ApplicationModule({
	imports: [new TaskDomainModule(), new TaskInfrastructureModule()],
	providers: [
		{
			provide: TaskApplicationService,
			useClass: TaskApplicationService,
		},
	],
	exports: [TaskApplicationService],
})
export class TaskApplicationModule extends Module {
	constructor() {
		super({
			imports: [new TaskDomainModule(), new TaskInfrastructureModule()],
			providers: [
				{
					provide: TaskApplicationService,
					useClass: TaskApplicationService,
				},
			],
			exports: [TaskApplicationService],
		})
	}
}
