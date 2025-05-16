import { Injectable } from '@/infrastructure/di'
import type { Telemetry } from './telemetry'

@Injectable()
export class OpenTelemetry implements Telemetry {
	constructor() {
		console.log(`[OpenTelemetry] Initializing`)
	}
	logEvent(name: string, message: string): void {
		console.log(`[OpenTelemetry] Logging event ${name}`, message)
	}
	logMetric(name: string, value: number): void {
		console.log(`[OpenTelemetry] Logging metric ${name}`, value)
	}
	logError(message: string, stack?: string): void {
		console.log(`[OpenTelemetry] Logging error ${message}`, stack)
	}
	startSpan(name: string): void {
		console.log(`[OpenTelemetry] Span started: ${name}`)
	}
}
