export interface WebSocketHandlerMetadata {
	event: string
	context: string
	description?: string
}

/**
 * Decorator for WebSocket Handlers (Adapters).
 * Registers metadata about the event handled and context.
 *
 * @param metadata Configuration metadata for the WebSocket handler
 */
export function WebSocketHandler(
	metadata: WebSocketHandlerMetadata,
): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('webSocketHandler:event', metadata.event, target)
		Reflect.defineMetadata('webSocketHandler:context', metadata.context, target)
		Reflect.defineMetadata(
			'webSocketHandler:description',
			metadata.description || '',
			target,
		)

		Reflect.defineMetadata('injectable', true, target)

		return target
	}
}
