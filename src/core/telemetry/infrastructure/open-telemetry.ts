import { Injectable } from 'src/core/di'
import type { Span, Telemetry, TelemetryOptions } from '../domain/telemetry'

class OpenTelemetrySpan implements Span {
	constructor(private readonly name: string) {}

	addAttribute(key: string, value: string | number | boolean): void {
		console.log(
			`[OpenTelemetry] Adding attribute ${key}=${value} to span ${this.name}`,
		)
	}

	end(): void {
		console.log(`[OpenTelemetry] Ending span ${this.name}`)
	}
}

@Injectable()
export class OpenTelemetry implements Telemetry {
	constructor(private readonly options: TelemetryOptions) {
		console.log(
			`[OpenTelemetry] Initializing with service ${options.serviceName} v${options.serviceVersion}`,
		)
	}

	startSpan(name: string): Span {
		console.log(`[OpenTelemetry] Starting span ${name}`)
		return new OpenTelemetrySpan(name)
	}

	recordMetric(
		name: string,
		value: number,
		attributes?: Record<string, string>,
	): void {
		console.log(`[OpenTelemetry] Recording metric ${name}=${value}`, attributes)
	}

	recordError(error: Error, attributes?: Record<string, string>): void {
		console.log(`[OpenTelemetry] Recording error ${error.message}`, attributes)
	}
}
