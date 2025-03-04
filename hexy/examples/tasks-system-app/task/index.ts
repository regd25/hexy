// Export modules
export { TaskModule } from './task-module'

// Export domain types
export { Task, TaskId } from './domain/aggregate/task'
export { TaskRepository } from './domain/aggregate/task-repository'
export { TaskDomainService } from './domain/service/task-domain-service'

// Export application services
export { TaskApplicationService } from './application/task-application-service'

// Export infrastructure implementations
export { InMemoryTaskRepository } from './infrastructure/repository/in-memory-task-repository'
export { TASK_REPOSITORY } from './infrastructure/task-infrastructure-module'

