import { AggregateRoot } from '../aggregate'
import { DependencyInjection } from '../dependency-injection'
import { Repository } from '../repository'
import { Service } from '../service'
import { UseCase } from '../use-case/use-case'

/**
 * @description Context class
 */
export class Context {
	/**
	 * @description Constructor
	 * @param name - The name of the context
	 * @param dependencyInjection - The dependency injection instance
	 */
	constructor(
		readonly name: string,
		private readonly dependencyInjection: DependencyInjection,
	) {}

	/**
	 * @description Gets a service
	 * @param name - The name of the service
	 * @returns The service
	 */
	async getService(name: string): Promise<Service> {
		return this.dependencyInjection.getService(name)
	}

	/**
	 * @description Gets a repository
	 * @param name - The name of the repository
	 * @returns The repository
	 */
	async getRepository(name: string): Promise<Repository> {
		return this.dependencyInjection.getRepository(name)
	}

	/**
	 * @description Gets a use case
	 * @param name - The name of the use case
	 * @returns The use case
	 */
	async getUseCase(name: string): Promise<UseCase> {
		return this.dependencyInjection.getUseCase(name)
	}
}
