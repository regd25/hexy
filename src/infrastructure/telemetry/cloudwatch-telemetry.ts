import { Injectable } from '@/infrastructure/di'
import type { Telemetry } from './telemetry'
import { CloudWatch } from 'aws-sdk'

interface MetricDimension {
	Name: string
	Value: string
}

@Injectable()
export class CloudWatchTelemetry implements Telemetry {
	private readonly cloudWatch: CloudWatch
	private readonly namespace: string = 'HexyApplication'

	constructor() {
		this.cloudWatch = new CloudWatch({
			region: process.env['AWS_REGION'] || 'us-east-1',
		})
		console.log(
			`[CloudWatchTelemetry] Initializing with namespace: ${this.namespace}`,
		)
	}

	startSpan(name: string): void {
		console.log(`[CloudWatchTelemetry] Span started: ${name}`)
	}

	async logEvent(name: string, message: string): Promise<void> {
		await this.sendMetric({
			MetricName: name,
			Value: 1,
			Unit: 'Count',
			Dimensions: [
				{ Name: 'EventType', Value: 'CustomEvent' },
			],
			extraLog: `[CloudWatchTelemetry] Logged event ${name}: ${message}`,
			errorLog: `[CloudWatchTelemetry] Error logging event ${name}:`,
		})
	}

	async logMetric(name: string, value: number): Promise<void> {
		await this.sendMetric({
			MetricName: name,
			Value: value,
			Unit: 'None',
			Dimensions: [],
			extraLog: `[CloudWatchTelemetry] Logged metric ${name}: ${value}`,
			errorLog: `[CloudWatchTelemetry] Error logging metric ${name}:`,
		})
	}

	async logError(message: string, stack?: string): Promise<void> {
		await this.sendMetric({
			MetricName: 'Error',
			Value: 1,
			Unit: 'Count',
			Dimensions: [
				{ Name: 'ErrorMessage', Value: message },
			],
			extraLog: stack
				? `[CloudWatchTelemetry] Error logged: ${message}\nStack: ${stack}`
				: `[CloudWatchTelemetry] Error logged: ${message}`,
			errorLog: `[CloudWatchTelemetry] Error logging error:`,
			isError: true,
		})
	}

	private async sendMetric({
		MetricName,
		Value,
		Unit,
		Dimensions = [],
		extraLog,
		errorLog,
		isError = false,
	}: {
		MetricName: string
		Value: number
		Unit: string
		Dimensions?: MetricDimension[]
		extraLog?: string
		errorLog?: string
		isError?: boolean
	}): Promise<void> {
		try {
			await this.cloudWatch
				.putMetricData({
					Namespace: this.namespace,
					MetricData: [
						{
							MetricName,
							Value,
							Unit,
							Timestamp: new Date(),
							...(Dimensions.length > 0 ? { Dimensions } : {}),
						},
					],
				})
				.promise()
			if (extraLog) {
				isError ? console.error(extraLog) : console.log(extraLog)
			}
		} catch (error) {
			if (errorLog) {
				console.error(errorLog, error)
			}
		}
	}
}
