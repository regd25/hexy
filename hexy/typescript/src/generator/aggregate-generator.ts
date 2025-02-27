import * as fs from "fs"
import * as path from "path"
import { toSnakeCase, toPascalCase } from "./utilities"

/**
 * Creates an aggregate file in the domain.
 * @param basePath - The base path for the service.
 * @param aggregate - The aggregate name.
 * @param voDefinitions - Array of value object definitions.
 */
export function createAggregateFile(
  basePath: string,
  aggregate: string,
  voDefinitions: Array<{ name: string; type: string }>
): void {
  const aggregatePascal = toPascalCase(aggregate)
  const aggregateSnake = toSnakeCase(aggregate)

  // Prepare default for id: UuidValueObject
  const voImports = new Set<string>()
  voImports.add(`import { UuidValueObject } from "hexy"`)

  const parameters = []
  const assignments = []
  const primitives: string[] = []

  const typeMapping: Record<string, string> = {
    string: "StringValueObject",
    integer: "IntegerValueObject",
    float: "FloatValueObject",
    boolean: "BooleanValueObject",
    uuid: "UuidValueObject",
    email: "EmailValueObject",
    phone: "PhoneNumberValueObject",
    money: "MoneyValueObject",
    number_id: "NumberIdValueObject",
    date: "DateValueObject",
    enum: "EnumValueObject",
  }

  // Exclude value objects with name "id"
  const filteredVoDefinitions = voDefinitions.filter(
    (vo) => vo.name.toLowerCase() !== "id"
  )

  for (const vo of filteredVoDefinitions) {
    const voSnake = toSnakeCase(vo.name)
    const voPascal = toPascalCase(vo.name)
    voImports.add(`import { ${voPascal} } from "./${voSnake}"`)
    parameters.push(`${voSnake}: ${voPascal}`)
    assignments.push(`this._${voSnake} = ${voSnake};`)
    primitives.push(`"${voSnake}": String(this._${voSnake}.value)`)
  }

  const aggregateContent = `${[...voImports].sort().join("\n")}

import { AggregateRoot } from "hexy";

export class ${aggregatePascal} extends AggregateRoot {
${filteredVoDefinitions
  .map((vo) => {
    const voSnake = toSnakeCase(vo.name)
    const voPascal = toPascalCase(vo.name)
    return `  private _${voSnake}: ${voPascal};`
  })
  .join("\n")}

  constructor(${parameters.join(", ")}) {
    super();
    ${assignments.join("\n    ")}
  }
${filteredVoDefinitions
  .map((vo) => {
    const voSnake = toSnakeCase(vo.name)
    const voPascal = toPascalCase(vo.name)
    return `  get ${voSnake}(): ${voPascal} {\n    return this._${voSnake};\n  }`
  })
  .join("\n\n")}

  toPrimitives(): Record<string, any> {
    return {
      ${primitives.join(",\n      ")}
    };
  }

  static create(${parameters.join(", ")}): ${aggregatePascal} {
    return new ${aggregatePascal}(${parameters
    .map((param) => param.split(":")[0])
    .join(", ")});
  }
}
`
  fs.writeFileSync(
    path.join(basePath, "domain", `${aggregateSnake}.ts`),
    aggregateContent
  )
  console.log(`Created aggregate: ${aggregatePascal}`)
}
