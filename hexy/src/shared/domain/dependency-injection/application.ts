import { Container, Provider } from './container'
import { Module } from './module'
import { getModuleFromClass } from './module-decorator'
import { Token } from './token'
import { ServiceNotFoundError } from './service-not-found-error'
import { ResolveError } from './resolve-error'

/**
 * Configuration options for the application.
 */
export interface ApplicationOptions {
	/**
	 * Global providers that will be available throughout the application.
	 */
	providers?: Provider[]

	/**
	 * Whether to automatically scan and register all injectable classes.
	 */
	autoScan?: boolean
}

/**
 * The main application class that bootstraps the DI container.
 */
export class Application {
	private readonly container: Container
	private initialized = false

	constructor(private options: ApplicationOptions = {}) {
		this.container = new Container()

		// Register global providers if any
		if (options.providers && options.providers.length > 0) {
			this.container.registerMany(options.providers)
		}
	}

	/**
	 * Bootstraps the application with a root module.
	 */
	bootstrap(moduleClass: any): this {
		if (this.initialized) {
			throw new Error('Application has already been initialized')
		}

		// Get module definition
		const module = getModuleFromClass(moduleClass)
		if (!module) {
			throw new Error(`Invalid module class: ${moduleClass.name}`)
		}

		// Register all providers from the module
		const providers = module.getAllProviders()
		this.container.registerMany(providers)

		this.initialized = true
		return this
	}

	/**
	 * Gets a service instance from the container.
	 * @throws ServiceNotFoundError if the service is not found
	 */
	get<T>(token: Token<T>): T {
		try {
			return this.container.resolve<T>(token)
		} catch (error) {
			if (
				error instanceof ResolveError &&
				error.message.includes('No provider found')
			) {
				throw new ServiceNotFoundError(String(token))
			}
			throw error
		}
	}

	/**
	 * Checks if a service is registered in the container.
	 */
	has(token: Token): boolean {
		return this.container.has(token)
	}

	/**
	 * Registers additional providers in the container.
	 */
	register(provider: Provider): this {
		this.container.register(provider)
		return this
	}

	/**
	 * Registers multiple providers in the container.
	 */
	registerMany(providers: Provider[]): this {
		this.container.registerMany(providers)
		return this
	}

	/**
	 * Clears all cached instances but keeps providers.
	 */
	clearInstances(): this {
		this.container.clearInstances()
		return this
	}

	/**
	 * Completely resets the application, removing all providers and instances.
	 */
	reset(): this {
		this.container.reset()
		this.initialized = false
		return this
	}
}
