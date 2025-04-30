/**
 * Represents a constructor type for a class.
 * Allows specifying the instance type T.
 */
export type Class<T = any> = new (...args: any[]) => T
