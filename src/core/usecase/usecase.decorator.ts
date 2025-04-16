/**
 * Interface defining parameters for the UseCase decorator
 */
export interface UseCaseOptions {
	summary: string
	inputSchema: any
	outputSchema: any
	tags?: string[]
}

/**
 * Decorator for use cases that applies metadata and enables cross-cutting concerns
 * such as documentation, validation, and tracing.
 *
 * @param options Configuration options for the use case
 */
export function UseCase(options: UseCaseOptions): ClassDecorator {
	return function (target: any) {
		// Store metadata about the use case
		Reflect.defineMetadata('useCase:summary', options.summary, target)
		Reflect.defineMetadata('useCase:inputSchema', options.inputSchema, target)
		Reflect.defineMetadata('useCase:outputSchema', options.outputSchema, target)
		Reflect.defineMetadata('useCase:tags', options.tags || [], target)

		// Here you would also apply other decorators like @Traceable
		// or add other cross-cutting concerns

		return target
	}
}
