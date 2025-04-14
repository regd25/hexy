import { DomainModule } from 'src/core'
import { TaskDomainService } from './service/task-domain-service'
import { createToken } from 'src/core'

export const TASK_REPOSITORY = createToken('TASK_REPOSITORY')

/**
 * Module for Task domain components
 */
@DomainModule({
	providers: [
		{
			provide: TaskDomainService,
			useClass: TaskDomainService,
		},
	],
	exports: [TaskDomainService, TASK_REPOSITORY],
})
export class TaskDomainModule {}
