import { Injectable } from '../dependency-injection/injectable'
import { Inject } from '../dependency-injection/inject'
import { type OnInit } from '../dependency-injection/lifecycle'
import { Context } from './context'
import { type IContextRepository } from './context-repository'
import { CONTEXT_REPOSITORY_TOKEN } from './tokens'

/**
 * @description Service for managing contexts
 * Provides high-level operations for creating, retrieving, and managing contexts
 */
@Injectable()
export class ContextService implements OnInit {
	private activeContext: Context | null = null

	constructor(
		@Inject(CONTEXT_REPOSITORY_TOKEN)
		private readonly contextRepository: IContextRepository,
	) {}

	/**
	 * Lifecycle hook that runs after the service is created
	 */
	async onInit(): Promise<void> {
		// Initialize with a root context if needed
		await this.createRootContext()
	}

	/**
	 * @description Creates a root context if none exists
	 * @returns A promise that resolves to the root context
	 */
	private async createRootContext(): Promise<Context> {
		const rootContext = new Context()
		rootContext.addMetadata('isRoot', true)
		rootContext.addMetadata('description', 'Root application context')

		await this.contextRepository.save(rootContext)
		this.activeContext = rootContext

		return rootContext
	}

	/**
	 * @description Gets the current active context
	 * @returns The active context or null if none is set
	 */
	getActiveContext(): Context | null {
		return this.activeContext
	}

	/**
	 * @description Sets the active context
	 * @param contextId - The ID of the context to set as active
	 * @returns A promise that resolves to the active context
	 */
	async setActiveContext(contextId: string): Promise<Context> {
		const context = await this.contextRepository.findById(contextId)
		if (!context) {
			throw new Error(`Context with ID ${contextId} not found`)
		}

		this.activeContext = context
		return context
	}

	/**
	 * @description Creates a new context as a child of the active context
	 * @param metadata - Optional metadata to add to the context
	 * @returns A promise that resolves to the new context
	 */
	async createContext(metadata?: Record<string, any>): Promise<Context> {
		if (!this.activeContext) {
			return this.createRootContext()
		}

		const childContext = this.activeContext.createChildContext()

		if (metadata) {
			Object.entries(metadata).forEach(([key, value]) => {
				childContext.addMetadata(key, value)
			})
		}

		await this.contextRepository.save(childContext)
		this.activeContext = childContext

		return childContext
	}

	/**
	 * @description Gets a context by its ID
	 * @param contextId - The ID of the context to get
	 * @returns A promise that resolves to the context or null if not found
	 */
	async getContext(contextId: string): Promise<Context | null> {
		return this.contextRepository.findById(contextId)
	}

	/**
	 * @description Gets all child contexts of a parent context
	 * @param parentId - The ID of the parent context
	 * @returns A promise that resolves to an array of child contexts
	 */
	async getChildContexts(parentId: string): Promise<Context[]> {
		return this.contextRepository.findChildContexts(parentId)
	}

	/**
	 * @description Updates a context in the repository
	 * @param context - The context to update
	 * @returns A promise that resolves when the context is updated
	 */
	async updateContext(context: Context): Promise<void> {
		await this.contextRepository.update(context)

		// Update active context if it's the one being updated
		if (this.activeContext && this.activeContext.id === context.id) {
			this.activeContext = context
		}
	}

	/**
	 * @description Deletes a context from the repository
	 * @param contextId - The ID of the context to delete
	 * @returns A promise that resolves when the context is deleted
	 */
	async deleteContext(contextId: string): Promise<void> {
		// Can't delete the active context
		if (this.activeContext && this.activeContext.id === contextId) {
			throw new Error('Cannot delete the active context')
		}

		await this.contextRepository.delete(contextId)
	}
}
