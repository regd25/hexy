import 'reflect-metadata'
import { type Token } from './token'
import { Scope } from './scope'
import { ResolveError } from './resolve-error'
import { isOnInit, isOnDestroy, LifecycleState } from './lifecycle'
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
	private lifecycleState = new LifecycleState()

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

				const paramTypes =
					Reflect.getMetadata('design:paramtypes', classToInstantiate) || []

				const injectTokens =
					Reflect.getMetadata('inject:tokens', classToInstantiate) || []

				const inferenceFlags =
					Reflect.getMetadata('inject:inference', classToInstantiate) || []

				const dependencies = paramTypes.map((paramType: any, index: number) => {
					const useInference = inferenceFlags[index] === true
					const customToken = injectTokens[index]

					// When using inference, customToken will be undefined
					// but we want to use the parameter type for resolution
					const tokenToUse = useInference
						? paramType
						: customToken !== undefined
							? customToken
							: paramType

					return this.resolve(tokenToUse)
				})

				instance = new classToInstantiate(...dependencies)
			}

			if (provider.scope === Scope.SINGLETON) {
				this.instances.set(token, instance)
			}

			this.callInitHook(instance)

			return instance
		} finally {
			this.resolving.delete(token)
		}
	}

	/**
	 * Clears all cached instances but keeps providers.
	 */
	clearInstances(): void {
		// Call destroy lifecycle hooks before clearing instances
		this.instances.forEach((instance) => {
			this.callDestroyHook(instance)
		})

		this.instances.clear()
	}

	/**
	 * Completely resets the container, removing all providers and instances.
	 */
	reset(): void {
		// Call destroy lifecycle hooks before resetting
		this.instances.forEach((instance) => {
			this.callDestroyHook(instance)
		})

		this.providers.clear()
		this.instances.clear()
	}

	/**
	 * Calls the initialize hook if implemented
	 */
	private callInitHook(instance: any): void {
		if (isOnInit(instance) && !this.lifecycleState.isInitialized(instance)) {
			instance.onInit()
			this.lifecycleState.markInitialized(instance)
		}
	}

	/**
	 * Calls the destroy hook if implemented
	 */
	private callDestroyHook(instance: any): void {
		if (
			isOnDestroy(instance) &&
			!this.lifecycleState.isDestroyCalled(instance)
		) {
			instance.onDestroy()
			this.lifecycleState.markDestroyedCalled(instance)
		}
	}
}
