/**
 * Internal event bus for decoupled communication between components
 * Implements the observer pattern for event-driven architecture
 */
export class EventBus {
  private readonly listeners: Map<string, EventListener<any>[]> = new Map();
  private readonly maxListeners = 100; // Prevent memory leaks

  /**
   * Subscribe to events of a specific type
   */
  public on<T = unknown>(eventType: string, listener: EventListener<T>): EventUnsubscriber {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const currentListeners = this.listeners.get(eventType)!;
    
    if (currentListeners.length >= this.maxListeners) {
      throw new EventBusError(
        `Maximum number of listeners (${this.maxListeners}) exceeded for event type: ${eventType}`,
        'MAX_LISTENERS_EXCEEDED'
      );
    }

    currentListeners.push(listener);

    // Return unsubscriber function
    return () => {
      const index = currentListeners.indexOf(listener);
      if (index > -1) {
        currentListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to events but automatically unsubscribe after first occurrence
   */
  public once<T = unknown>(eventType: string, listener: EventListener<T>): EventUnsubscriber {
    const unsubscribe = this.on(eventType, (event: DomainEvent<T>) => {
      unsubscribe();
      listener(event);
    });

    return unsubscribe;
  }

  /**
   * Emit an event to all subscribers
   */
  public emit<T = unknown>(eventType: string, data: T, metadata?: EventMetadata): void {
    const listeners = this.listeners.get(eventType);
    if (!listeners || listeners.length === 0) {
      return;
    }

    const event: DomainEvent<T> = {
      type: eventType,
      data,
      timestamp: new Date(),
      id: this.generateEventId(),
      metadata: metadata || {}
    };

    // Execute listeners asynchronously to avoid blocking
    setImmediate(() => {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
          // Emit error event for monitoring
          this.emitError(eventType, error as Error, event);
        }
      });
    });
  }

  /**
   * Emit an event asynchronously and wait for all listeners to complete
   */
  public async emitAsync<T = unknown>(eventType: string, data: T, metadata?: EventMetadata): Promise<void> {
    const listeners = this.listeners.get(eventType);
    if (!listeners || listeners.length === 0) {
      return;
    }

    const event: DomainEvent<T> = {
      type: eventType,
      data,
      timestamp: new Date(),
      id: this.generateEventId(),
      metadata: metadata || {}
    };

    // Execute all listeners and wait for completion
    const promises = listeners.map(listener => {
      return new Promise<void>((resolve) => {
        try {
          const result = listener(event);
          if (result instanceof Promise) {
            result.then(() => resolve()).catch((error) => {
              console.error(`Error in async event listener for ${eventType}:`, error);
              this.emitError(eventType, error, event);
              resolve();
            });
          } else {
            resolve();
          }
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
          this.emitError(eventType, error as Error, event);
          resolve();
        }
      });
    });

    await Promise.all(promises);
  }

  /**
   * Remove all listeners for a specific event type
   */
  public removeAllListeners(eventType: string): void {
    this.listeners.delete(eventType);
  }

  /**
   * Get the number of listeners for an event type
   */
  public listenerCount(eventType: string): number {
    const listeners = this.listeners.get(eventType);
    return listeners ? listeners.length : 0;
  }

  /**
   * Get all registered event types
   */
  public getEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clear all event listeners (useful for cleanup)
   */
  public clear(): void {
    this.listeners.clear();
  }

  private emitError(eventType: string, error: Error, originalEvent: DomainEvent): void {
    // Avoid infinite loops by not emitting error events for error events
    if (eventType === EventTypes.ERROR) {
      console.error(`Error in event listener for ${eventType}:`, error);
      return;
    }

    this.emit(EventTypes.ERROR, {
      originalEventType: eventType,
      originalEvent,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Types and interfaces
export interface DomainEvent<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: Date;
  metadata: EventMetadata;
}

export interface EventMetadata {
  source?: string;
  correlationId?: string;
  userId?: string;
  processId?: string;
  [key: string]: unknown;
}

export const EventTypes = {
  PROCESS_STARTED: 'process.started',
  PROCESS_STEP_EXECUTED: 'process.step.executed',
  PROCESS_COMPLETED: 'process.completed',
  PROCESS_FAILED: 'process.failed',
  PROCESS_CANCELLED: 'process.cancelled',
  
  ARTIFACT_CREATED: 'artifact.created',
  ARTIFACT_UPDATED: 'artifact.updated',
  ARTIFACT_DELETED: 'artifact.deleted',
  ARTIFACT_VALIDATED: 'artifact.validated',
  
  POLICY_VIOLATED: 'policy.violated',
  POLICY_EVALUATED: 'policy.evaluated',
  
  RESULT_EMITTED: 'result.emitted',
  
  ERROR: 'system.error',
  WARNING: 'system.warning'
};

export type EventListener<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;
export type EventUnsubscriber = () => void;

export class EventBusError extends Error {
  constructor(
    message: string,
    public readonly code: EventBusErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EventBusError';
  }
}

export type EventBusErrorCode = 'MAX_LISTENERS_EXCEEDED'; 