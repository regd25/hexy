import { Command } from 'commander'
import {
	CreateContextUseCase,
	CreateContextInput,
} from '../../application/use-case/create-context.usecase'
import chalk from 'chalk'
import ora from 'ora'

export class CreateContextCommand {
	public static register(program: Command): void {
		program
			.command('create-context <context>')
			.description(
				'Creates a new bounded context with domain, application and infrastructure layers',
			)
			.option('-s, --service', 'Create a service template in the domain layer')
			.option(
				'-u, --use-case',
				'Create a use-case template in the application layer',
			)
			.option(
				'-a, --aggregate',
				'Create an aggregate template in the domain layer',
			)
			.option(
				'-v, --value-object',
				'Create a value-object template in the domain layer',
			)
			.action(async (context: string, options) => {
				const spinner = ora('Creating new context...')

				try {
					// This would typically be injected through dependency injection
					const useCase = new CreateContextUseCase()
					const input: CreateContextInput = {
						contextName: context,
					}

					const result = await useCase.execute(input)

					if (result.success) {
						spinner.succeed(chalk.green(result.message))

						// Handle optional templates
						if (options.service) {
							console.log(
								chalk.blue(
									'✓ Service template option detected - would create service here',
								),
							)
							// Implementation for service template would go here
						}

						if (options.useCase) {
							console.log(
								chalk.blue(
									'✓ Use Case template option detected - would create use case here',
								),
							)
							// Implementation for use case template would go here
						}

						if (options.aggregate) {
							console.log(
								chalk.blue(
									'✓ Aggregate template option detected - would create aggregate here',
								),
							)
							// Implementation for aggregate template would go here
						}

						if (options.valueObject) {
							console.log(
								chalk.blue(
									'✓ Value Object template option detected - would create value object here',
								),
							)
							// Implementation for value object template would go here
						}

						console.log(chalk.green('\nContext created successfully!'))
						console.log(chalk.gray('Structure:'))
						console.log(chalk.gray('  ├── domain/'))
						console.log(chalk.gray('  ├── application/'))
						console.log(chalk.gray('  ├── infrastructure/'))
						console.log(chalk.gray('  └── module.ts'))
					} else {
						spinner.fail(chalk.red(result.message))
					}
				} catch (error) {
					spinner.fail(
						chalk.red(
							`Failed to create context: ${error instanceof Error ? error.message : 'Unknown error'}`,
						),
					)
					process.exit(1)
				}
			})
	}
}
