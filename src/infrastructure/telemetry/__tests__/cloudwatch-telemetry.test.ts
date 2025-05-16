import { CloudWatch } from 'aws-sdk'
import { CloudWatchTelemetry } from '../cloudwatch-telemetry'

// Mock AWS SDK
jest.mock('aws-sdk', () => {
	const mockPutMetricData = jest.fn().mockReturnValue({
		promise: jest.fn().mockResolvedValue({}),
	})

	return {
		CloudWatch: jest.fn().mockImplementation(() => ({
			putMetricData: mockPutMetricData,
		})),
	}
})

describe('CloudWatchTelemetry', () => {
	let telemetry: CloudWatchTelemetry
	let mockCloudWatch: jest.Mocked<CloudWatch>

	beforeEach(() => {
		jest.clearAllMocks()
		telemetry = new CloudWatchTelemetry()
		mockCloudWatch = new CloudWatch() as jest.Mocked<CloudWatch>
	})

	describe('logEvent', () => {
		it('should successfully log an event', async () => {
			const eventName = 'TestEvent'
			const message = 'Test message'

			await telemetry.logEvent(eventName, message)

			expect(mockCloudWatch.putMetricData).toHaveBeenCalledWith({
				Namespace: 'HexyApplication',
				MetricData: [
					{
						MetricName: eventName,
						Value: 1,
						Unit: 'Count',
						Timestamp: expect.any(Date),
						Dimensions: [
							{
								Name: 'EventType',
								Value: 'CustomEvent',
							},
						],
					},
				],
			})
		})

		it('should handle errors when logging an event', async () => {
			const error = new Error('AWS Error')
			mockCloudWatch.putMetricData.mockReturnValueOnce({
				promise: jest.fn().mockRejectedValue(error),
			} as any)

			const consoleSpy = jest.spyOn(console, 'error')
			await telemetry.logEvent('TestEvent', 'Test message')

			expect(consoleSpy).toHaveBeenCalledWith(
				'[CloudWatchTelemetry] Error logging event TestEvent:',
				error,
			)
		})
	})

	describe('logMetric', () => {
		it('should successfully log a metric', async () => {
			const metricName = 'TestMetric'
			const value = 42

			await telemetry.logMetric(metricName, value)

			expect(mockCloudWatch.putMetricData).toHaveBeenCalledWith({
				Namespace: 'HexyApplication',
				MetricData: [
					{
						MetricName: metricName,
						Value: value,
						Unit: 'None',
						Timestamp: expect.any(Date),
					},
				],
			})
		})

		it('should handle errors when logging a metric', async () => {
			const error = new Error('AWS Error')
			mockCloudWatch.putMetricData.mockReturnValueOnce({
				promise: jest.fn().mockRejectedValue(error),
			} as any)

			const consoleSpy = jest.spyOn(console, 'error')
			await telemetry.logMetric('TestMetric', 42)

			expect(consoleSpy).toHaveBeenCalledWith(
				'[CloudWatchTelemetry] Error logging metric TestMetric:',
				error,
			)
		})
	})

	describe('logError', () => {
		it('should successfully log an error with message', async () => {
			const errorMessage = 'Test error message'

			await telemetry.logError(errorMessage)

			expect(mockCloudWatch.putMetricData).toHaveBeenCalledWith({
				Namespace: 'HexyApplication',
				MetricData: [
					{
						MetricName: 'Error',
						Value: 1,
						Unit: 'Count',
						Timestamp: expect.any(Date),
						Dimensions: [
							{
								Name: 'ErrorMessage',
								Value: errorMessage,
							},
						],
					},
				],
			})
		})

		it('should successfully log an error with message and stack', async () => {
			const errorMessage = 'Test error message'
			const stack = 'Error stack trace'

			const consoleSpy = jest.spyOn(console, 'error')
			await telemetry.logError(errorMessage, stack)

			expect(consoleSpy).toHaveBeenCalledWith(
				'[CloudWatchTelemetry] Error logged: Test error message\nStack: Error stack trace',
			)
		})

		it('should handle errors when logging an error', async () => {
			const error = new Error('AWS Error')
			mockCloudWatch.putMetricData.mockReturnValueOnce({
				promise: jest.fn().mockRejectedValue(error),
			} as any)

			const consoleSpy = jest.spyOn(console, 'error')
			await telemetry.logError('Test error message')

			expect(consoleSpy).toHaveBeenCalledWith(
				'[CloudWatchTelemetry] Error logging error:',
				error,
			)
		})
	})

	describe('startSpan', () => {
		it('should log span start', () => {
			const consoleSpy = jest.spyOn(console, 'log')
			telemetry.startSpan('TestSpan')
			expect(consoleSpy).toHaveBeenCalledWith('[CloudWatchTelemetry] Span started: TestSpan')
			consoleSpy.mockRestore()
		})
	})
})
