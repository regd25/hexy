import * as fs from "fs"
import * as path from "path"
import { toPascalCase, toSnakeCase } from "./utilities"

/**
 * Creates a repository file in the infrastructure.
 * @param basePath - The base path for the service.
 * @param repository - The repository name.
 * @param aggregate - The aggregate name associated.
 */
export function createRepositoryFile(
  basePath: string,
  repository: string,
  aggregate: string
): void {
  const repositoryPascal = toPascalCase(repository)
  const repositorySnake = toSnakeCase(repository)
  const aggregatePascal = toPascalCase(aggregate)
  const aggregateSnake = toSnakeCase(aggregate)

  const content = `import { Criteria } from "hexy";
import { ${aggregatePascal} } from "../domain/${aggregateSnake}";

export abstract class ${repositoryPascal} {
  abstract save(entity: ${aggregatePascal}): Promise<void>;
  abstract search(id: string): Promise<${aggregatePascal} | null>;
  abstract searchAll(): Promise<${aggregatePascal}[]>;
  abstract matching(criteria: Criteria): Promise<${aggregatePascal}[]>;
}
`
  fs.writeFileSync(
    path.join(basePath, "infrastructure", `${repositorySnake}.ts`),
    content
  )
  console.log(`Created repository: ${repositoryPascal}`)
}
