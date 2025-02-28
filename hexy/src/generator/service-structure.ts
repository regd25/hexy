import * as fs from "fs"
import * as path from "path"
import { toSnakeCase } from "./utilities"

/**
 * Creates the service structure directories.
 * @param context - The context name.
 * @param boundedContext - The bounded context (service name).
 * @returns The base path for the service structure.
 */
export function createServiceStructure(
  context: string,
  boundedContext: string
): string {
  const basePath = path.join(
    "src",
    toSnakeCase(context),
    toSnakeCase(boundedContext)
  )
  const directories = ["application", "domain", "infrastructure"]
  directories.forEach((dir) => {
    const dirPath = path.join(basePath, dir)
    fs.mkdirSync(dirPath, { recursive: true })
    // Create an empty index.ts file in each directory
    fs.writeFileSync(path.join(dirPath, "index.ts"), "")
    console.log(`Created directory: ${dirPath}`)
  })
  return basePath
}
