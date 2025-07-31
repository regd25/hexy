/**
 * Central event bus for component communication
 * Follows Observer pattern for loose coupling
 */
export class EventBus {
    constructor() {
        this.subscribers = new Map();
        this.middleware = [];
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} context - Handler context
     * @returns {Function} Unsubscribe function
     */
    subscribe(event, handler, context = null) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }

        const subscription = { handler, context };
        this.subscribers.get(event).push(subscription);

        // Return unsubscribe function
        return () => this.unsubscribe(event, handler);
    }

    /**
     * Publish an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    publish(event, data = null) {
        if (!this.subscribers.has(event)) {
            return;
        }

        const subscriptions = this.subscribers.get(event);
        const eventData = { event, data, timestamp: Date.now() };

        const processedData = this.applyMiddleware(eventData);

        subscriptions.forEach(({ handler, context }) => {
            try {
                if (context) {
                    handler.call(context, processedData);
                } else {
                    handler(processedData);
                }
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    unsubscribe(event, handler) {
        if (!this.subscribers.has(event)) {
            return;
        }

        const subscriptions = this.subscribers.get(event);
        const index = subscriptions.findIndex(sub => sub.handler === handler);

        if (index !== -1) {
            subscriptions.splice(index, 1);
        }
    }

    /**
     * Add middleware for event processing
     * @param {Function} middleware - Middleware function
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Apply middleware to event data
     * @param {Object} eventData - Event data
     * @returns {Object} Processed event data
     */
    applyMiddleware(eventData) {
        return this.middleware.reduce((data, middleware) => {
            return middleware(data);
        }, eventData);
    }

    /**
     * Clear all subscribers
     */
    clear() {
        this.subscribers.clear();
    }
}