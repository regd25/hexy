/**
 * Simple logger implementation for Hexy CLI and applications.
 */
export const logger = {
  /**
   * Log informational message
   */
  info: (message: string, ...args: any[]): void => {
    console.log(`[INFO] ${message}`, ...args);
  },
  
  /**
   * Log warning message
   */
  warn: (message: string, ...args: any[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  /**
   * Log error message
   */
  error: (message: string, ...args: any[]): void => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  /**
   * Log debug message (only in development)
   */
  debug: (message: string, ...args: any[]): void => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}; 