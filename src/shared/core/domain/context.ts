import { Injectable } from 'shared/di'
import { type OnInit } from 'shared/di'
import { UuidValueObject, type IdentifierValueObject } from './value-objects'

/**
 * @description Interface for context metadata
 * Defines the structure of additional data that can be attached to a context
 */
export interface ContextMetadata {
	[key: string]: any
}

/**
 * @description Base context interface
 * Defines the minimum structure that all contexts must implement
 */
export interface IContext {
	id: IdentifierValueObject
	createdAt: Date
	parentId?: IdentifierValueObject
	metadata: ContextMetadata
	addMetadata(key: string, value: any): void
	getMetadata<T>(key: string): T | undefined
	hasParent(): boolean
}

/**
 * @description Base implementation of a context
 * Provides core functionality for context tracking and management
 */
@Injectable()
export class Context implements IContext, OnInit {
	id: IdentifierValueObject
	createdAt: Date
	parentId?: IdentifierValueObject
	metadata: ContextMetadata = {}

	constructor() {
		this.id = UuidValueObject.generate()
		this.createdAt = new Date()
	}

	/**
	 * Lifecycle hook that runs after the context is created
	 */
	onInit(): void {
		// Can be extended in subclasses to perform initialization logic
	}

	/**
	 * @description Creates a new context as a child of the current one
	 * This establishes a parent-child relationship between contexts
	 * @returns A new child context
	 */
	createChildContext(): Context {
		const childContext = new Context()
		childContext.parentId = this.id
		return childContext
	}

	/**
	 * @description Adds metadata to the context
	 * @param key - The metadata key
	 * @param value - The metadata value
	 */
	addMetadata(key: string, value: any): void {
		this.metadata[key] = value
	}

	/**
	 * @description Gets metadata from the context
	 * @param key - The metadata key
	 * @returns The metadata value or undefined if not found
	 */
	getMetadata<T>(key: string): T | undefined {
		return this.metadata[key] as T
	}

	/**
	 * @description Checks if the context has a parent
	 * @returns True if the context has a parent, false otherwise
	 */
	hasParent(): boolean {
		return Boolean(this.parentId)
	}

	/**
	 * @description Creates a serializable representation of the context
	 * @returns A serializable object with the context data
	 */
	toJSON(): Record<string, any> {
		return {
			id: this.id,
			createdAt: this.createdAt,
			parentId: this.parentId,
			metadata: this.metadata,
		}
	}

	/**
	 * @description Creates a context from a serialized object
	 * @param data - The serialized context data
	 * @returns A new context instance
	 */
	static fromJSON(data: Record<string, any>): Context {
		const context = new Context()
		context.id = data['id']
		context.createdAt = new Date(data['createdAt'])
		context.parentId = data['parentId']
		context.metadata = data['metadata'] || {}
		return context
	}
}
