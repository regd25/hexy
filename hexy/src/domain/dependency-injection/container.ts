import 'reflect-metadata'
import { Token } from './token'
import { Scope } from './scope'
import { ResolveError } from './resolve-error'
/**
 * Provider configuration for the DI container.
 */
export interface Provider<T = any> {
	provide: Token<T>
	useClass?: { new (...args: any[]): T }
	useValue?: T
	useFactory?: (...args: any[]) => T
	inject?: Token[]
	scope?: Scope
}

/**
 * The Dependency Injection container responsible for registering and resolving dependencies.
 */
export class Container {
	private providers = new Map<Token, Provider>()
	private instances = new Map<Token, any>()
	private resolving = new Set<Token>()

	/**
	 * Registers a provider in the container.
	 */
	register<T>(provider: Provider<T>): void {
		this.providers.set(provider.provide, {
			...provider,
			scope: provider.scope || Scope.SINGLETON,
		})
	}

	/**
	 * Registers multiple providers in the container.
	 */
	registerMany(providers: Provider[]): void {
		providers.forEach((provider) => this.register(provider))
	}

	/**
	 * Registers a class as a provider using its constructor as the token.
	 */
	registerClass<T>(
		constructor: { new (...args: any[]): T },
		scope: Scope = Scope.SINGLETON,
	): void {
		this.register({
			provide: constructor,
			useClass: constructor,
			scope,
		})
	}

	/**
	 * Checks if a provider is registered for the given token.
	 */
	has(token: Token): boolean {
		return this.providers.has(token)
	}

	/**
	 * Resolves a dependency from the container.
	 */
	resolve<T>(token: Token<T>): T {
		if (this.resolving.has(token)) {
			throw new ResolveError(
				`Circular dependency detected while resolving token: ${String(token)}`,
			)
		}

		const provider = this.providers.get(token)
		if (!provider) {
			throw new ResolveError(`No provider found for token: ${String(token)}`)
		}

		if (provider.scope === Scope.SINGLETON && this.instances.has(token)) {
			return this.instances.get(token)
		}

		this.resolving.add(token)

		try {
			let instance: T

			// Create instance based on provider type
			if (provider.useValue !== undefined) {
				// Value provider
				instance = provider.useValue
			} else if (provider.useFactory) {
				// Factory provider
				const deps = (provider.inject || []).map((depToken) =>
					this.resolve(depToken),
				)
				instance = provider.useFactory(...deps)
			} else {
				// Class provider
				const classToInstantiate = provider.useClass || (token as any)

				// Get constructor parameter types using reflection
				const paramTypes =
					Reflect.getMetadata('design:paramtypes', classToInstantiate) || []

				// Get custom injection tokens if any
				const injectTokens =
					Reflect.getMetadata('inject:tokens', classToInstantiate) || []

				// Resolve dependencies
				const dependencies = paramTypes.map((paramType: any, index: number) => {
					const customToken = injectTokens[index]
					return this.resolve(customToken || paramType)
				})

				// Create instance with dependencies
				instance = new classToInstantiate(...dependencies)
			}

			if (provider.scope === Scope.SINGLETON) {
				this.instances.set(token, instance)
			}

			return instance
		} finally {
			this.resolving.delete(token)
		}
	}

	/**
	 * Clears all cached instances but keeps providers.
	 */
	clearInstances(): void {
		this.instances.clear()
	}

	/**
	 * Completely resets the container, removing all providers and instances.
	 */
	reset(): void {
		this.providers.clear()
		this.instances.clear()
		this.resolving.clear()
	}
}
