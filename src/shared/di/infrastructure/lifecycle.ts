/**
 * Interface for components that need to perform initialization
 * after all dependencies have been injected
 */
export interface OnInit {
	/**
	 * Method called after component instantiation and dependency injection
	 */
	onInit(): void | Promise<void>
}

/**
 * Interface for components that need to perform cleanup
 * when they are destroyed/removed from the container
 */
export interface OnDestroy {
	/**
	 * Method called when the component is about to be destroyed
	 */
	onDestroy(): void | Promise<void>
}

/**
 * Helper function to check if an object implements OnInit
 */
export function isOnInit(obj: any): obj is OnInit {
	return obj && typeof obj.onInit === 'function'
}

/**
 * Helper function to check if an object implements OnDestroy
 */
export function isOnDestroy(obj: any): obj is OnDestroy {
	return obj && typeof obj.onDestroy === 'function'
}

/**
 * LifecycleState tracks which lifecycle hooks have been called
 * to prevent duplicate calls
 */
export class LifecycleState {
	private readonly initialized = new WeakSet<object>()
	private readonly destroyCalled = new WeakSet<object>()

	/**
	 * Marks an instance as initialized
	 */
	markInitialized(instance: object): void {
		this.initialized.add(instance)
	}

	/**
	 * Checks if an instance has already been initialized
	 */
	isInitialized(instance: object): boolean {
		return this.initialized.has(instance)
	}

	/**
	 * Marks that onDestroy has been called for an instance
	 */
	markDestroyedCalled(instance: object): void {
		this.destroyCalled.add(instance)
	}

	/**
	 * Checks if onDestroy has already been called for an instance
	 */
	isDestroyCalled(instance: object): boolean {
		return this.destroyCalled.has(instance)
	}
}
