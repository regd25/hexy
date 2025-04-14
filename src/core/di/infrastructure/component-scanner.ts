import { Container, type Provider } from './container'
import {
	isDomainService,
	isDomainRepository,
	isDomainAggregate,
	isDomainEntity,
	isDomainValueObject,
	isDomainEvent,
} from './layers/domain-layer'
import {
	isApplicationService,
	isApplicationUseCase,
} from './layers/application-layer'
import {
	isInfrastructureService,
	isInfrastructureRepository,
} from './layers/infrastructure-layer'

/**
 * Configuration for the component scanner
 */
export interface ComponentScannerOptions {
	/**
	 * Directories to scan for components
	 */
	include?: string[]

	/**
	 * Directories to exclude from scanning
	 */
	exclude?: string[]

	/**
	 * If true, the scanner will register components automatically
	 * when they are found with appropriate layer decorators
	 */
	autoRegister?: boolean
}

/**
 * Component scanner for automatically discovering and registering
 * decorated classes as providers in the DI container.
 */
export class ComponentScanner {
	private container: Container
	private options: ComponentScannerOptions

	constructor(container: Container, options: ComponentScannerOptions = {}) {
		this.container = container
		this.options = {
			include: options.include || [],
			exclude: options.exclude || [],
			autoRegister: options.autoRegister !== false, // default to true
		}
	}

	/**
	 * Scans for components with DDD layer decorators and registers them
	 * in the container based on their layer type.
	 *
	 * @param components An array of class constructors to scan
	 * @returns The providers that were registered
	 */
	scanComponents(components: any[]): Provider[] {
		const providers: Provider[] = []

		for (const component of components) {
			// Check for various layer-specific decorators
			let provider: Provider | null = null

			// Domain layer
			if (isDomainService(component)) {
				provider = { provide: component, useClass: component }
			} else if (isDomainRepository(component)) {
				provider = { provide: component, useClass: component }
			} else if (isDomainAggregate(component)) {
				provider = { provide: component, useClass: component }
			} else if (isDomainEntity(component)) {
				provider = { provide: component, useClass: component }
			} else if (isDomainValueObject(component)) {
				provider = { provide: component, useClass: component }
			} else if (isDomainEvent(component)) {
				provider = { provide: component, useClass: component }
			}

			// Application layer
			else if (isApplicationService(component)) {
				provider = { provide: component, useClass: component }
			} else if (isApplicationUseCase(component)) {
				provider = { provide: component, useClass: component }
			}

			// Infrastructure layer
			else if (isInfrastructureService(component)) {
				provider = { provide: component, useClass: component }
			} else if (isInfrastructureRepository(component)) {
				provider = { provide: component, useClass: component }
			}

			if (provider) {
				providers.push(provider)

				// Auto-register if enabled
				if (this.options.autoRegister) {
					this.container.register(provider)
				}
			}
		}

		return providers
	}
}
