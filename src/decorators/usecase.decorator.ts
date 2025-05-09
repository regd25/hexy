/**
 * Interface defining parameters for the UseCase decorator
 */
export interface UseCaseMetadata {
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
 * @param metadata Configuration metadata for the use case
 */
export function RegisterUseCase(metadata: UseCaseMetadata): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('useCase:summary', metadata.summary, target)
		Reflect.defineMetadata('useCase:inputSchema', metadata.inputSchema, target)
		Reflect.defineMetadata('useCase:outputSchema', metadata.outputSchema, target)
		Reflect.defineMetadata('useCase:tags', metadata.tags || [], target)

		Reflect.defineMetadata('injectable', true, target)

		if (metadata.traceable) {
			Reflect.defineMetadata('traceable', true, target)
		}

		return target
	}
}
