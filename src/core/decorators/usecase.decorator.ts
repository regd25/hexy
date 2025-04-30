/**
 * Interface defining parameters for the UseCase decorator
 */
export interface UseCaseOptions {
	summary: string
	inputSchema: any
	outputSchema: any
	tags?: string[]
	traceable?: boolean
}

/**
 * Decorator for use cases that applies metadata and enables cross-cutting concerns
 * such as documentation, validation, and tracing.
 *
 * @param options Configuration options for the use case
 */
export function UseCase(options: UseCaseOptions): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('useCase:summary', options.summary, target)
		Reflect.defineMetadata('useCase:inputSchema', options.inputSchema, target)
		Reflect.defineMetadata('useCase:outputSchema', options.outputSchema, target)
		Reflect.defineMetadata('useCase:tags', options.tags || [], target)

		Reflect.defineMetadata('injectable', true, target)

		if (options.traceable) {
			Reflect.defineMetadata('traceable', true, target)
		}

		return target
	}
}
