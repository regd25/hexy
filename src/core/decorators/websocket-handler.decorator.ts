export interface WebSocketHandlerOptions {
	event: string
	context: string
	description?: string
}

/**
 * Decorator for WebSocket Handlers (Adapters).
 * Registers metadata about the event handled and context.
 *
 * @param options Configuration options for the WebSocket handler
 */
export function WebSocketHandler(
	options: WebSocketHandlerOptions,
): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('webSocketHandler:event', options.event, target)
		Reflect.defineMetadata('webSocketHandler:context', options.context, target)
		Reflect.defineMetadata(
			'webSocketHandler:description',
			options.description || '',
			target,
		)

		Reflect.defineMetadata('injectable', true, target)

		return target
	}
}
