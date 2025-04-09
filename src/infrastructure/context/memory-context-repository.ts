import { Injectable } from '../../domain/dependency-injection/injectable'
import { Context } from '../../domain/contexts/context'
import { type IContextRepository } from '../../domain/contexts/context-repository'

/**
 * @description In-memory implementation of the context repository
 * Stores contexts in memory for development and testing purposes
 */
@Injectable()
export class MemoryContextRepository implements IContextRepository {
  private contexts: Map<string, Context> = new Map()

  /**
   * @description Saves a context to the in-memory storage
   * @param context - The context to save
   */
  async save(context: Context): Promise<void> {
    this.contexts.set(context.id, context)
  }

  /**
   * @description Finds a context by its ID
   * @param id - The ID of the context to find
   * @returns The context or null if not found
   */
  async findById(id: string): Promise<Context | null> {
    const context = this.contexts.get(id)
    return context || null
  }

  /**
   * @description Finds all child contexts of a parent context
   * @param parentId - The ID of the parent context
   * @returns An array of child contexts
   */
  async findChildContexts(parentId: string): Promise<Context[]> {
    return Array.from(this.contexts.values())
      .filter(context => context.parentId === parentId)
  }

  /**
   * @description Deletes a context from the in-memory storage
   * @param id - The ID of the context to delete
   */
  async delete(id: string): Promise<void> {
    this.contexts.delete(id)
  }

  /**
   * @description Updates an existing context in the in-memory storage
   * @param context - The context to update
   */
  async update(context: Context): Promise<void> {
    if (!this.contexts.has(context.id)) {
      throw new Error(`Context with ID ${context.id} not found`)
    }
    
    this.contexts.set(context.id, context)
  }
} 