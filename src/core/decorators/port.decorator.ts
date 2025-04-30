/**
 * Interface defining parameters for the Port decorator
 */
export interface PortOptions {
	context: string
	description?: string
	type?: PORT_TYPES
}

export enum PORT_TYPES {
	REPOSITORY = 'repository',
	EVENT_BUS = 'event-bus',
	DATA_SOURCE = 'data-source',
	DATA_MAPPER = 'data-mapper',
	DAO = 'dao',
	TELEMETRY = 'telemetry',
	EVENT_HANDLER = 'event-handler',
	SERVICE = 'service',
	CONTROLLER = 'controller',
}

/**
 * Decorator for Ports (interfaces defining contracts for infrastructure)
 * that applies metadata for documentation and tooling.
 *
 * @param options Configuration options for the port
 */
export function Port(options: PortOptions): ClassDecorator {
	return function (target: any) {
		Reflect.defineMetadata('port:context', options.context, target)
		Reflect.defineMetadata(
			'port:description',
			options.description || '',
			target,
		)
		Reflect.defineMetadata(
			'port:type',
			options.type ?? PORT_TYPES.SERVICE,
			target,
		)

		return target
	}
}
