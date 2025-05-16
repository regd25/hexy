/**
 * @description Base telemetry interface
 */
export interface Telemetry {
	startSpan(name: string): void
	logEvent(name: string, message: string): void
	logMetric(name: string, value: number): void
	logError(message: string, stack?: string): void
}
