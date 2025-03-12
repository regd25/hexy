import { Provider } from './container'
import { Token } from './token'

/**
 * Configuration for a DI module.
 */
export interface ModuleOptions {
	providers: Provider[]
	imports?: Module[]
	exports?: (Provider | Module | Token<any>)[]
}

/**
 * A module that groups related providers together.
 * Modules can import other modules and export providers.
 */
export class Module {
	private readonly providers: Provider[]
	private readonly imports: Module[]
	private readonly exports: (Provider | Module | Token<any>)[]

	/**
	 * Flag to track if the module has been initialized through the constructor
	 * Used by the ModuleDecorator to prevent double initialization
	 */
	protected _initialized: boolean = false

	constructor(options: ModuleOptions) {
		this.providers = options.providers || []
		this.imports = options.imports || []
		this.exports = options.exports || []
		this._initialized = true
	}

	get initialized(): boolean {
		return this._initialized
	}

	/**
	 * Gets all providers defined in this module and its imports.
	 */
	getAllProviders(): Provider[] {
		// Get providers from imported modules
		const importedProviders = this.imports.flatMap((module) =>
			module.getExportedProviders(),
		)

		// Combine with this module's providers
		return [...this.providers, ...importedProviders]
	}

	/**
	 * Gets providers exported by this module.
	 */
	getExportedProviders(): Provider[] {
		const result: Provider[] = []

		// Add directly exported providers
		for (const exportItem of this.exports) {
			if (exportItem instanceof Module) {
				// If exporting a module, add all its exported providers
				result.push(...exportItem.getExportedProviders())
			} else if (typeof exportItem === 'object' && 'provide' in exportItem) {
				// If exporting a provider directly
				result.push(exportItem)
			}
			// Skip token exports - they're handled below
		}

		// Add this module's providers that are explicitly exported
		for (const provider of this.providers) {
			if (this.exports.some((exp) => exp === provider.provide)) {
				result.push(provider)
			}
		}

		return result
	}

	/**
	 * Gets the modules that this module imports.
	 * Useful for dependency validation.
	 */
	getImportedModules(): Module[] {
		return [...this.imports]
	}

	/**
	 * Gets the constructor names of the imported modules.
	 * Useful for dependency validation.
	 */
	getImportedModuleNames(): string[] {
		return this.imports.map((module) => module.constructor.name)
	}
}
