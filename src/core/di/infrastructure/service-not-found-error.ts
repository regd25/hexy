/**
 * Error thrown when a service is not found in the DI container.
 */
export class ServiceNotFoundError extends Error {
  constructor(serviceName: string) {
    super(`Service not found: ${serviceName}`);
    this.name = 'ServiceNotFoundError';
  }
} 