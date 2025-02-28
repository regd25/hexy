import * as hexy from '../shared/domain/value-objects'
import * as fs from 'fs'
import * as path from 'path'
import { toSnakeCase, toPascalCase } from './utilities'

/**
 * Creates a value object file in the domain.
 * @param basePath - The base path for the service.
 * @param voName - The name of the value object.
 * @param voType - The type of the value object.
 */
export function createValueObjectFile(
	basePath: string,
	voName: string,
	voType: string,
): void {
	const voPascal = toPascalCase(voName)
	const voSnake = toSnakeCase(voName)

	// Dynamically create a type mapping from the 'hexy' module
	const typeMapping: Record<string, string> = {}
	Object.keys(hexy).forEach((key) => {
		// Consider only keys ending with "ValueObject"
		if (key.endsWith('ValueObject')) {
			// Create a short key e.g. "string" for "StringValueObject"
			const shortKey = key.slice(0, -'ValueObject'.length).toLowerCase()
			typeMapping[shortKey] = key
		}
	})

	// If the type provided exists among the value objects, use it; otherwise fallback to "ValueObject"
	const baseClass = typeMapping[voType.toLowerCase()] || 'ValueObject'
	const content = `import { ${baseClass} } from "hexy";

export class ${voPascal} extends ${baseClass} {}
`
	fs.writeFileSync(path.join(basePath, 'domain', `${voSnake}.ts`), content)
	console.log(`Created value object: ${voPascal} (${baseClass})`)
}
