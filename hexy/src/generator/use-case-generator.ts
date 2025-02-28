import * as fs from "fs"
import * as path from "path"
import { toPascalCase, toSnakeCase } from "./utilities"

/**
 * Creates a use case file in the application.
 * @param basePath - The base path for the service.
 * @param useCase - The use case name.
 * @param aggregate - The aggregate name associated.
 */
export function createUseCaseFile(
  basePath: string,
  useCase: string,
  aggregate: string
): void {
  const useCaseSnake = toSnakeCase(useCase)
  const useCasePascal = toPascalCase(useCase)
  const aggregatePascal = toPascalCase(aggregate)
  const aggregateSnake = toSnakeCase(aggregate)

  const content = `import { UseCase } from "hexy";
import { ${aggregatePascal} } from "../domain/${aggregateSnake}";

export class ${useCasePascal} implements UseCase<${useCasePascal}Input, ${useCasePascal}Output> {
  async execute(input: ${useCasePascal}Input): Promise<${useCasePascal}Output> {
    // TODO: implement use case logic
    throw new Error("Not implemented");
  }
}
`
  fs.writeFileSync(
    path.join(basePath, "application", `${useCaseSnake}.ts`),
    content
  )
  console.log(`Created use case: ${useCasePascal} (${useCaseSnake}.ts)`)
}
