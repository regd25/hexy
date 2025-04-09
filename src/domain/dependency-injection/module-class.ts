import { container } from '.'
import { type Provider } from './container'
import { type Token } from './token'

/**
 * Configuration for a DI module.
 */
export interface ModuleOptions {
	providers: Provider[]
	imports?: ModuleClass[]
	exports?: (Provider | ModuleClass | Token<any>)[]
}

/**
 * A module that groups related providers together.
 * Modules can import other modules and export providers.
 */
export class ModuleClass {
	private readonly providers: Provider[]
	private readonly imports: ModuleClass[]
	private readonly exports: (Provider | ModuleClass | Token<any>)[]

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
		const result: Provider[] = [...this.providers]

		for (const importedModule of this.imports) {
			const moduleProviders = importedModule.getAllProviders()
			const exportedProviders = moduleProviders.filter((provider) =>
				importedModule.exports.includes(provider.provide),
			)
			result.push(...exportedProviders)
		}

		return result
	}

	/**
	 * Gets providers exported by this module.
	 */
	getExportedProviders(): Provider[] {
		const result: Provider[] = []

		for (const exportItem of this.exports) {
			if (exportItem instanceof ModuleClass) {
				result.push(...exportItem.getExportedProviders())
			} else if (typeof exportItem === 'object' && 'provide' in exportItem) {
				result.push(exportItem)
			}
		}

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
	getImportedModules(): ModuleClass[] {
		return [...this.imports]
	}

	/**
	 * Gets the constructor names of the imported modules.
	 * Useful for dependency validation.
	 */
	getImportedModuleNames(): string[] {
		return this.imports.map((module) => module.constructor.name)
	}

	async initialize(): Promise<void> {
		for (const importedModule of this.imports) {
			if (typeof importedModule.initialize === 'function') {
				await importedModule.initialize()
			}
		}

		for (const provider of this.providers) {
			const instance = container.resolve(provider.provide)
			if (instance && typeof instance.initialize === 'function') {
				await instance.initialize()
			}
		}
	}
}
