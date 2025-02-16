/**
 * @description Error thrown when a service is not found
 */
export class ServiceNotFoundError extends Error {
	constructor(serviceName: string) {
		super(`Service ${serviceName} not found`)
	}
}
