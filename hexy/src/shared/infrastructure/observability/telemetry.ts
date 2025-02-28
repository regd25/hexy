import { Injectable } from '../../domain/dependency-injection'

export interface TelemetryOptions {
	serviceName: string
	serviceVersion: string
}

export interface Span {
	addAttribute(key: string, value: string | number | boolean): void
	end(): void
}

@Injectable()
export abstract class Telemetry {
	abstract startSpan(name: string): Span
	abstract recordMetric(
		name: string,
		value: number,
		attributes?: Record<string, string>,
	): void
	abstract recordError(error: Error, attributes?: Record<string, string>): void
}
