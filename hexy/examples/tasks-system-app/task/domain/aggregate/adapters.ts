/**
 * Este archivo proporciona adaptadores y wrappers para compatibilizar las implementaciones
 * de Task con las clases base de Hexy
 */

import { EventBus, AbstractRepository, IdentifierValueObject } from 'hexy'
import { Task, TaskId } from './task'

/**
 * Implementación abstracta base para repositorios de Task
 */
export abstract class TaskAbstractRepository extends AbstractRepository<Task> {
	constructor(eventBus?: EventBus) {
		super(eventBus)
	}

	// Métodos específicos para Task
	abstract findById(id: TaskId): Promise<Task | null>
	abstract findAll(): Promise<Task[]>
	abstract findByCompleted(completed: boolean): Promise<Task[]>
	abstract delete(id: TaskId): Promise<void>

	// Compatibilidad con Repository
	async exists(id: IdentifierValueObject): Promise<boolean> {
		if (id instanceof TaskId) {
			const task = await this.findById(id)
			return task !== null
		}
		return false
	}
}
