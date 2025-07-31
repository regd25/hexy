/**
 * Dependency injection container
 * Manages service lifecycle and dependencies
 */
export class ServiceContainer {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
        this.factories = new Map();
    }

    /**
     * Register a service
     * @param {string} name - Service name
     * @param {Function} factory - Service factory function
     * @param {boolean} singleton - Whether service should be singleton
     */
    register(name, factory, singleton = true) {
        if (singleton) {
            this.singletons.set(name, factory);
        } else {
            this.factories.set(name, factory);
        }
    }

    /**
     * Get a service instance
     * @param {string} name - Service name
     * @returns {*} Service instance
     */
    get(name) {
        // Check if already instantiated
        if (this.services.has(name)) {
            return this.services.get(name);
        }

        // Check singletons
        if (this.singletons.has(name)) {
            const factory = this.singletons.get(name);
            const instance = factory(this);
            this.services.set(name, instance);
            return instance;
        }

        // Check factories
        if (this.factories.has(name)) {
            const factory = this.factories.get(name);
            return factory(this);
        }

        throw new Error(`Service '${name}' not registered`);
    }

    /**
     * Check if service is registered
     * @param {string} name - Service name
     * @returns {boolean} Whether service is registered
     */
    has(name) {
        return this.singletons.has(name) || this.factories.has(name);
    }

    /**
     * Remove a service
     * @param {string} name - Service name
     */
    remove(name) {
        this.services.delete(name);
        this.singletons.delete(name);
        this.factories.delete(name);
    }

    /**
     * Clear all services
     */
    clear() {
        this.services.clear();
        this.singletons.clear();
        this.factories.clear();
    }

    /**
     * Get all registered service names
     * @returns {string[]} Array of service names
     */
    getRegisteredServices() {
        const services = new Set();

        this.singletons.forEach((_, name) => services.add(name));
        this.factories.forEach((_, name) => services.add(name));

        return Array.from(services);
    }

    /**
     * Get service instance count
     * @returns {number} Number of instantiated services
     */
    getInstanceCount() {
        return this.services.size;
    }
} 