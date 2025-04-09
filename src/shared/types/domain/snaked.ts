/**
 * Utility type that converts camelCase string to snake_case
 */
type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Capitalize<T>
    ? `_${Lowercase<T>}${CamelToSnakeCase<U>}`
    : `${T}${CamelToSnakeCase<U>}`
  : S;

/**
 * Converts all keys in an object from camelCase to snake_case
 */
export type Snaked<T> = T extends object
  ? {
      [K in keyof T as CamelToSnakeCase<K & string>]: T[K] extends object
        ? Snaked<T[K]>
        : T[K];
    }
  : T;
