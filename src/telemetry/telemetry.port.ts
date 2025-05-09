/**
 * @description Base telemetry interface
 */
export interface Telemetry {
	logEvent(name: string): void
	logMetric(name: string, value: number): void
	logError(message: string, stack?: string): void
}
