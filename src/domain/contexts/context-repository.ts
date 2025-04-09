import { Context } from './context'

/**
 * @description Interface for context repository
 * Defines the contract for storing and retrieving contexts
 */
export interface IContextRepository {
	/**
	 * @description Saves a context to the repository
	 * @param context - The context to save
	 * @returns A promise that resolves when the context is saved
	 */
	save(context: Context): Promise<void>

	/**
	 * @description Finds a context by its ID
	 * @param id - The ID of the context to find
	 * @returns A promise that resolves to the context or null if not found
	 */
	findById(id: string): Promise<Context | null>

	/**
	 * @description Finds all child contexts of a parent context
	 * @param parentId - The ID of the parent context
	 * @returns A promise that resolves to an array of child contexts
	 */
	findChildContexts(parentId: string): Promise<Context[]>

	/**
	 * @description Deletes a context from the repository
	 * @param id - The ID of the context to delete
	 * @returns A promise that resolves when the context is deleted
	 */
	delete(id: string): Promise<void>

	/**
	 * @description Updates an existing context in the repository
	 * @param context - The context to update
	 * @returns A promise that resolves when the context is updated
	 */
	update(context: Context): Promise<void>
}
