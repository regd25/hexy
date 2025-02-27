/**
 * Utility functions for string transformations.
 */

export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/^_/, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

export function toPascalCase(str: string): string {
  const snake = toSnakeCase(str);
  return snake
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
} 