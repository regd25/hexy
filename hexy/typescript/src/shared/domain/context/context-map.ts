import { Context } from './context'

/**
 * @description Context map
 */
export class ContextMap {
	/**
	 * @description Constructor
	 */
	constructor(private readonly contexts: Record<string, Context>) {}

	/**
	 * @description Gets a context
	 * @param name - The name of the context
	 * @returns The context
	 */
	getContext(name: string): Context {
		return this.contexts[name]
	}

	/**
	 * @description Gets all contexts
	 * @returns All contexts
	 */
	getAllContexts(): Context[] {
		return Object.values(this.contexts)
	}

	/**
	 * @description Adds a context
	 * @param name - The name of the context
	 * @param context - The context
	 */
	registerContext(name: string, context: Context): void {
		this.contexts[name] = context
	}
}
