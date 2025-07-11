/**
 * Jest Setup File
 * Global test configurations and mocks
 */

// Extend Jest matchers if needed
// import '@testing-library/jest-dom'

// Global test timeout
jest.setTimeout(30000)

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Global mocks for common dependencies
global.Date = class extends Date {
  constructor(date?: string | number | Date) {
    if (date) {
      super(date)
    } else {
      super("2024-01-01T00:00:00.000Z")
    }
  }
}

// Mock UUID generation for consistent tests
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-1234-5678-9012"),
}))

// Global test helpers
global.createMockDate = (dateString: string = "2024-01-01T00:00:00.000Z") => {
  return new Date(dateString)
}
