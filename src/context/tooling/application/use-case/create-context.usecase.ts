import * as fs from 'fs/promises'
import * as path from 'path'
import { CommandUseCase, UseCase } from 'core/context'

export class CreateContextInput {
	constructor(public readonly contextName: string) {}
}

export class CreateContextOutput {
	constructor(
		public readonly success: boolean,
		public readonly message: string,
	) {}
}

@UseCase({
	summary:
		'Creates a new bounded context with domain, application and infrastructure layers',
	inputSchema: CreateContextInput,
	outputSchema: CreateContextOutput,
	tags: ['tooling', 'code-generation'],
})
export class CreateContextUseCase extends CommandUseCase<
	CreateContextInput,
	CreateContextOutput
> {
	async execute(input: CreateContextInput): Promise<CreateContextOutput> {
		const { contextName } = input
		const basePath = path.join('src', 'contexts', contextName)
		const domainPath = path.join(basePath, 'domain')
		const applicationPath = path.join(basePath, 'application')
		const infrastructurePath = path.join(basePath, 'infrastructure')
		const modulePath = path.join(basePath, 'module.ts')

		try {
			try {
				await fs.access(basePath)
				return new CreateContextOutput(
					false,
					`Context '${contextName}' already exists at ${basePath}.`,
				)
			} catch (error: any) {
				if (error.code !== 'ENOENT') {
					throw error
				}
			}

			// Create directories
			await fs.mkdir(domainPath, { recursive: true })
			await fs.mkdir(applicationPath, { recursive: true })
			await fs.mkdir(infrastructurePath, { recursive: true })

			// Create module.ts file
			const moduleContent = `import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: [],
})
export class ${this.toPascalCase(contextName)}Module {}
`

			await fs.writeFile(modulePath, moduleContent)

			// Create .gitkeep files for empty directories
			await fs.writeFile(path.join(domainPath, '.gitkeep'), '')
			await fs.writeFile(path.join(applicationPath, '.gitkeep'), '')
			await fs.writeFile(path.join(infrastructurePath, '.gitkeep'), '')

			return new CreateContextOutput(
				true,
				`Context '${contextName}' created successfully.`,
			)
		} catch (error) {
			return new CreateContextOutput(
				false,
				`Failed to create context '${contextName}': ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
		}
	}

	private toPascalCase(str: string): string {
		return str
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('')
	}
}
