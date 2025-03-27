import { Body, Controller, Delete, Get, Param, Post } from '@hexy/infrastructure'
import { Inject } from '@hexy/domain'
import { type CreateTaskDto } from '../../application/dto/create-task.dto'
import { TaskApplicationService } from '../../application/task-application-service'

/**
 * REST API controller for Task resources
 */
@Controller('/api/tasks')
export class TaskController {
	constructor(@Inject() private readonly taskService: TaskApplicationService) {}

	/**
	 * Get all tasks
	 */
	@Get()
	async getAllTasks() {
		const tasks = await this.taskService.getAllTasks()
		return { tasks }
	}

	/**
	 * Get task by ID
	 */
	@Get('/:id')
	async getTaskById(@Param('id') id: string) {
		const task = await this.taskService.getTaskById(id)
		if (!task) {
			return { error: 'Task not found' }
		}
		return { task }
	}

	/**
	 * Create a new task
	 */
	@Post()
	async createTask(@Body() createTaskDto: CreateTaskDto) {
		const task = await this.taskService.createTask(
			createTaskDto.title,
			createTaskDto.description,
		)
		return { task }
	}

	/**
	 * Delete a task
	 */
	@Delete('/:id')
	async deleteTask(@Param('id') id: string) {
		await this.taskService.deleteTask(id)
		return { success: true }
	}
}
