import { Port } from '../decorators/port.decorator'

/**
 * Interface for telemetry implementations.
 * Provides methods for logging events, metrics, and errors.
 */
@Port({ context: 'Core', description: 'Port for observability and telemetry' })
export abstract class Telemetry {
	/**
	 * Logs a named event.
	 * @param name The name of the event.
	 */
	abstract logEvent(name: string): void

	/**
	 * Logs a numerical metric.
	 * @param name The name of the metric.
	 * @param value The numerical value of the metric.
	 */
	abstract logMetric(name: string, value: number): void

	/**
	 * Logs an error.
	 * @param message The error message.
	 * @param stack Optional stack trace.
	 */
	abstract logError(message: string, stack?: string): void
}
