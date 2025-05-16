import { OpenTelemetry } from '../open-telemetry'

describe('OpenTelemetry', () => {
  let telemetry: OpenTelemetry
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log')
    telemetry = new OpenTelemetry()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('logEvent', () => {
    it('should log event with name and message', () => {
      const eventName = 'TestEvent'
      const message = 'Test message'

      telemetry.logEvent(eventName, message)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OpenTelemetry] Logging event TestEvent',
        message
      )
    })
  })

  describe('logMetric', () => {
    it('should log metric with name and value', () => {
      const metricName = 'TestMetric'
      const value = 42

      telemetry.logMetric(metricName, value)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OpenTelemetry] Logging metric TestMetric',
        value
      )
    })
  })

  describe('logError', () => {
    it('should log error with message only', () => {
      const errorMessage = 'Test error message'

      telemetry.logError(errorMessage)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OpenTelemetry] Logging error Test error message',
        undefined
      )
    })

    it('should log error with message and stack trace', () => {
      const errorMessage = 'Test error message'
      const stack = 'Error stack trace'

      telemetry.logError(errorMessage, stack)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[OpenTelemetry] Logging error Test error message',
        stack
      )
    })
  })

  describe('initialization', () => {
    it('should log initialization message', () => {
      expect(consoleSpy).toHaveBeenCalledWith('[OpenTelemetry] Initializing')
    })
  })

  describe('startSpan', () => {
    it('should log span start', () => {
      telemetry.startSpan('TestSpan')
      expect(consoleSpy).toHaveBeenCalledWith('[OpenTelemetry] Span started: TestSpan')
    })
  })
}) 