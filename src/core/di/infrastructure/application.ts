import { type Provider, Container } from './container'
import { getModuleLayer } from './module'
import type { ModuleClass } from './module-class'
import type { Token } from './token'

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
 * Application class that manages the DI container and module registration.
 * This is the main entry point for the dependency injection system.
 */
export class Application {
	private readonly container: Container
	private readonly modules: Map<string, ModuleClass> = new Map()

	// Track modules by layer for better organization
	private readonly layerModules: Map<string, Set<string>> = new Map([
		['application', new Set()],
		['domain', new Set()],
		['infrastructure', new Set()],
		['unknown', new Set()],
	])

	/**
	 * Creates a new Application instance with an empty container.
	 */
	constructor(private options: ApplicationOptions = {}) {
		this.container = new Container()

		// Register global providers if any
		if (options.providers && options.providers.length > 0) {
			this.container.registerMany(options.providers)
		}
	}

	/**
	 * Registers a module with the application.
	 * @param module The module to register
	 * @param name Optional name for the module (defaults to the module's constructor name)
	 */
	registerModule(moduleClass: any, name?: string): void {
		// Get the module instance (using the decorator)
		const module = new moduleClass()

		// Use the provided name or generate one from the class name
		const moduleName = name || moduleClass.name

		// Store the module
		this.modules.set(moduleName, module)

		// Register providers from the module
		const providers = module.getAllProviders()
		this.container.registerMany(providers)

		// Track module by layer
		const layer = getModuleLayer(moduleClass) || 'unknown'
		this.layerModules.get(layer)?.add(moduleName)
	}

	/**
	 * Registers multiple modules at once.
	 * @param modules Array of module classes to register
	 */
	registerModules(modules: any[]): void {
		modules.forEach((moduleClass) => this.registerModule(moduleClass))
	}

	/**
	 * Gets all modules registered for a specific layer
	 * @param layer The layer to get modules for
	 */
	getModulesByLayer(
		layer: 'application' | 'domain' | 'infrastructure' | 'unknown',
	): string[] {
		return Array.from(this.layerModules.get(layer) || [])
	}

	/**
	 * Resolves a dependency from the container.
	 * @param token The token to resolve
	 */
	resolve<T>(token: Token<T>): T {
		return this.container.resolve(token)
	}

	/**
	 * Registers a provider directly with the application.
	 * @param provider The provider to register
	 */
	register<T>(provider: Provider<T>): void {
		this.container.register(provider)
	}

	/**
	 * Gets the raw container for advanced use cases.
	 */
	getContainer(): Container {
		return this.container
	}

	/**
	 * Checks if a module is registered with the application.
	 * @param name The name of the module to check
	 */
	hasModule(name: string): boolean {
		return this.modules.has(name)
	}

	/**
	 * Gets a module by name.
	 * @param name The name of the module to get
	 */
	getModule(name: string): ModuleClass | undefined {
		return this.modules.get(name)
	}

	/**
	 * Validates that the application's layer dependencies are correctly structured.
	 * Ensures that:
	 * - Application layer can depend on Domain and Infrastructure
	 * - Domain layer can only depend on other Domain modules
	 * - Infrastructure layer can depend on Domain but not Application
	 *
	 * @returns True if dependencies are valid, false otherwise
	 */
	validateLayerDependencies(): { valid: boolean; violations: string[] } {
		const violations: string[] = []

		// Check domain modules - should only depend on other domain modules
		for (const moduleName of this.getModulesByLayer('domain')) {
			const module = this.modules.get(moduleName)!

			// Get imported modules through the module's getAllProviders method
			// which indirectly accesses the imports
			const importedModuleNames = this.getModuleImports(module)

			for (const importedName of importedModuleNames) {
				const importedLayer = this.getModuleLayer(importedName)

				if (importedLayer && importedLayer !== 'domain') {
					violations.push(
						`Invalid dependency: Domain module "${moduleName}" depends on ${importedLayer} module "${importedName}"`,
					)
				}
			}
		}

		// Check infrastructure modules - can depend on domain but not application
		for (const moduleName of this.getModulesByLayer('infrastructure')) {
			const module = this.modules.get(moduleName)!

			// Get imported modules through the module's getAllProviders method
			const importedModuleNames = this.getModuleImports(module)

			for (const importedName of importedModuleNames) {
				const importedLayer = this.getModuleLayer(importedName)

				if (importedLayer === 'application') {
					violations.push(
						`Invalid dependency: Infrastructure module "${moduleName}" depends on application module "${importedName}"`,
					)
				}
			}
		}

		return {
			valid: violations.length === 0,
			violations,
		}
	}

	/**
	 * Helper method to get the names of modules imported by a module
	 * without directly accessing private properties
	 */
	private getModuleImports(module: ModuleClass): string[] {
		// Use the new method to get imported module names
		return module.getImportedModuleNames()
	}

	/**
	 * Gets the layer of a module
	 */
	private getModuleLayer(moduleName: string): string | undefined {
		const moduleClass = this.modules.get(moduleName)?.constructor
		if (!moduleClass) return undefined
		return getModuleLayer(moduleClass)
	}
}
