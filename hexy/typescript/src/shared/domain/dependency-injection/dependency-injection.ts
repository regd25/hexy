import { AggregateRoot } from '../aggregate'
import { Criteria } from '../criteria'
import { Repository } from '../persistence'
import { Service } from '../service'
import { UseCase } from '../use-case/use-case'
import { RepositoryNotFoundError } from './repository-not-found-error'
import { ServiceNotFoundError } from './service-not-found-error'

/**
 * @description Dependency injection class
 * @template AggregateType - The type of aggregate root
 * @template CriteriaType - The type of criteria
 */
export class DependencyInjection {
	/**
	 * @description Constructor
	 * @param services - The services available in the context
	 * @param repositories - The repositories available in the context
	 */
	constructor(
		readonly services: Record<string, Service>,
		readonly repositories: Record<string, Repository<AggregateRoot, Criteria>>,
		readonly useCases: Record<string, UseCase>,
	) {}

	/**
	 * @description Gets a service
	 * @param name - The name of the service
	 * @returns The service
	 */
	async getService(name: string): Promise<Service> {
		if (!this.services[name]) {
			throw new ServiceNotFoundError(name)
		}
		return this.services[name]
	}

	/**
	 * @description Gets a repository
	 * @param name - The name of the repository
	 * @returns The repository
	 */
	async getRepository(name: string): Promise<Repository> {
		if (!this.repositories[name]) {
			throw new RepositoryNotFoundError(name)
		}
		return this.repositories[name]
	}

	/**
	 * @description Gets a use case
	 * @param name - The name of the use case
	 * @returns The use case
	 */
	async getUseCase(name: string): Promise<UseCase> {
		return this.useCases[name]
	}

	/**
	 * @description Registers a service
	 * @param name - The name of the service
	 * @param service - The service
	 */
	registerService(name: string, service: Service): void {
		this.services[name] = service
	}

	/**
	 * @description Registers a repository
	 * @param name - The name of the repository
	 * @param repository - The repository
	 */
	registerRepository(
		name: string,
		repository: Repository<AggregateRoot, Criteria>,
	): void {
		this.repositories[name] = repository
	}

	/**
	 * @description Registers a use case
	 * @param name - The name of the use case
	 * @param useCase - The use case
	 */
	registerUseCase(name: string, useCase: UseCase): void {
		this.useCases[name] = useCase
	}
}
