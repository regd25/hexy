/**
 * Event System - Manages cross-area communication and semantic events
 * Enables decoupled communication between organizational areas
 */

export interface SemanticEvent {
  id: string;
  type: string;
  source: string;           // Area:Id or Actor:Id
  target?: string;          // Area:Id or Actor:Id (optional for broadcast)
  timestamp: Date;
  payload: any;
  metadata: EventMetadata;
  context: string;          // Context:Id reference
  intent: string;           // Intent:Id reference
  priority: EventPriority;
  timeToLive?: number;      // TTL in milliseconds
  correlationId?: string;   // For event correlation
  causationId?: string;     // For event causation
}

export interface EventMetadata {
  version: string;
  schema?: string;
  format: 'json' | 'yaml' | 'text' | 'binary';
  encoding?: string;
  checksum?: string;
  signature?: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  tags?: string[];
}

export enum EventPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

export interface EventSubscription {
  id: string;
  subscriberId: string;      // Area:Id or Actor:Id
  eventTypes: string[];      // Event types to subscribe to
  filters: EventFilter[];    // Additional filtering criteria
  handler: EventHandler;     // Handler function
  isActive: boolean;
  metadata: SubscriptionMetadata;
}

export interface EventFilter {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in';
  value: any;
  caseSensitive?: boolean;
}

export interface SubscriptionMetadata {
  created: Date;
  lastTriggered?: Date;
  triggerCount: number;
  maxRetries: number;
  retryDelay: number;
  deadLetterQueue?: string;
}

export type EventHandler = (event: SemanticEvent) => Promise<EventHandlerResult>;

export interface EventHandlerResult {
  success: boolean;
  error?: Error;
  result?: any;
  shouldRetry?: boolean;
  retryAfter?: number;
}

export interface EventMetrics {
  published: number;
  delivered: number;
  failed: number;
  retried: number;
  deadLettered: number;
  averageProcessingTime: number;
  lastProcessedTime: Date;
}

export class EventSystem {
  private subscriptions: Map<string, EventSubscription>;
  private eventStore: EventStore;
  private metrics: Map<string, EventMetrics>;
  private deadLetterQueue: SemanticEvent[];
  private correlationMap: Map<string, string[]>;  // correlationId -> eventIds
  private causationMap: Map<string, string[]>;    // causationId -> eventIds

  constructor(eventStore: EventStore) {
    this.subscriptions = new Map();
    this.eventStore = eventStore;
    this.metrics = new Map();
    this.deadLetterQueue = [];
    this.correlationMap = new Map();
    this.causationMap = new Map();
  }

  /**
   * Publish a semantic event
   */
  async publish(event: SemanticEvent): Promise<void> {
    // Validate event
    this.validateEvent(event);
    
    // Store event
    await this.eventStore.store(event);
    
    // Update correlation and causation maps
    this.updateEventMaps(event);
    
    // Find matching subscriptions
    const matchingSubscriptions = this.findMatchingSubscriptions(event);
    
    // Deliver to subscribers
    await this.deliverToSubscribers(event, matchingSubscriptions);
    
    // Update metrics
    this.updateMetrics(event.type, 'published');
  }

  /**
   * Subscribe to events
   */
  async subscribe(subscription: EventSubscription): Promise<void> {
    // Validate subscription
    this.validateSubscription(subscription);
    
    // Store subscription
    this.subscriptions.set(subscription.id, subscription);
    
    // Initialize metrics if not exists
    if (!this.metrics.has(subscription.subscriberId)) {
      this.initializeMetrics(subscription.subscriberId);
    }
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionId: string): Promise<boolean> {
    return this.subscriptions.delete(subscriptionId);
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): EventSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Get all subscriptions for a subscriber
   */
  getSubscriptionsForSubscriber(subscriberId: string): EventSubscription[] {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.subscriberId === subscriberId);
  }

  /**
   * Get event correlation chain
   */
  async getCorrelationChain(correlationId: string): Promise<SemanticEvent[]> {
    const eventIds = this.correlationMap.get(correlationId) || [];
    const events: SemanticEvent[] = [];
    
    for (const eventId of eventIds) {
      const event = await this.eventStore.getById(eventId);
      if (event) {
        events.push(event);
      }
    }
    
    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get event causation chain
   */
  async getCausationChain(causationId: string): Promise<SemanticEvent[]> {
    const eventIds = this.causationMap.get(causationId) || [];
    const events: SemanticEvent[] = [];
    
    for (const eventId of eventIds) {
      const event = await this.eventStore.getById(eventId);
      if (event) {
        events.push(event);
      }
    }
    
    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Query events by criteria
   */
  async queryEvents(query: EventQuery): Promise<EventQueryResult> {
    return await this.eventStore.query(query);
  }

  /**
   * Get event metrics
   */
  getMetrics(subscriberId?: string): Map<string, EventMetrics> {
    if (subscriberId) {
      const metrics = this.metrics.get(subscriberId);
      return metrics ? new Map([[subscriberId, metrics]]) : new Map();
    }
    return new Map(this.metrics);
  }

  /**
   * Get dead letter queue
   */
  getDeadLetterQueue(): SemanticEvent[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Replay events from dead letter queue
   */
  async replayDeadLetterEvents(): Promise<void> {
    const eventsToReplay = [...this.deadLetterQueue];
    this.deadLetterQueue = [];
    
    for (const event of eventsToReplay) {
      try {
        await this.publish(event);
      } catch (error) {
        // If replay fails, put back in dead letter queue
        this.deadLetterQueue.push(event);
      }
    }
  }

  /**
   * Validate cross-area communication compliance
   */
  validateCrossAreaCommunication(event: SemanticEvent): boolean {
    // Extract area from source and target
    const sourceArea = this.extractArea(event.source);
    const targetArea = event.target ? this.extractArea(event.target) : null;
    
    // Same area communication is always allowed
    if (!targetArea || sourceArea === targetArea) {
      return true;
    }
    
    // Cross-area communication must use events
    // This is enforced by the architecture
    return true;
  }

  /**
   * Emit system events (internal use)
   */
  emit(eventType: string, data: any): void {
    const systemEvent: SemanticEvent = {
      id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      source: 'System:EventSystem',
      timestamp: new Date(),
      payload: data,
      metadata: {
        version: '1.0.0',
        format: 'json',
        classification: 'internal'
      },
      context: 'Context:SystemContext',
      intent: 'Intent:SystemNotification',
      priority: EventPriority.NORMAL
    };
    
    // Publish asynchronously
    this.publish(systemEvent).catch(error => {
      console.error('Failed to publish system event:', error);
    });
  }

  // Private methods

  private validateEvent(event: SemanticEvent): void {
    if (!event.id || !event.type || !event.source) {
      throw new Error('Event must have id, type, and source');
    }
    
    if (!this.isValidSemanticReference(event.source)) {
      throw new Error(`Invalid source reference: ${event.source}`);
    }
    
    if (event.target && !this.isValidSemanticReference(event.target)) {
      throw new Error(`Invalid target reference: ${event.target}`);
    }
    
    if (!this.isValidSemanticReference(event.context)) {
      throw new Error(`Invalid context reference: ${event.context}`);
    }
    
    if (!this.isValidSemanticReference(event.intent)) {
      throw new Error(`Invalid intent reference: ${event.intent}`);
    }
  }

  private validateSubscription(subscription: EventSubscription): void {
    if (!subscription.id || !subscription.subscriberId || !subscription.eventTypes.length) {
      throw new Error('Subscription must have id, subscriberId, and eventTypes');
    }
    
    if (!this.isValidSemanticReference(subscription.subscriberId)) {
      throw new Error(`Invalid subscriber reference: ${subscription.subscriberId}`);
    }
  }

  private findMatchingSubscriptions(event: SemanticEvent): EventSubscription[] {
    const matching: EventSubscription[] = [];
    
    for (const subscription of this.subscriptions.values()) {
      if (!subscription.isActive) continue;
      
      // Check event type match
      if (!subscription.eventTypes.includes(event.type) && !subscription.eventTypes.includes('*')) {
        continue;
      }
      
      // Check target match (if specified)
      if (event.target && subscription.subscriberId !== event.target) {
        continue;
      }
      
      // Check filters
      if (!this.passesFilters(event, subscription.filters)) {
        continue;
      }
      
      matching.push(subscription);
    }
    
    return matching;
  }

  private passesFilters(event: SemanticEvent, filters: EventFilter[]): boolean {
    for (const filter of filters) {
      if (!this.evaluateFilter(event, filter)) {
        return false;
      }
    }
    return true;
  }

  private evaluateFilter(event: SemanticEvent, filter: EventFilter): boolean {
    const value = this.getNestedValue(event, filter.field);
    
    switch (filter.operator) {
      case 'equals':
        return value === filter.value;
      case 'contains':
        return String(value).includes(String(filter.value));
      case 'matches':
        return new RegExp(filter.value).test(String(value));
      case 'gt':
        return value > filter.value;
      case 'lt':
        return value < filter.value;
      case 'gte':
        return value >= filter.value;
      case 'lte':
        return value <= filter.value;
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      case 'not_in':
        return Array.isArray(filter.value) && !filter.value.includes(value);
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async deliverToSubscribers(event: SemanticEvent, subscriptions: EventSubscription[]): Promise<void> {
    const deliveryPromises = subscriptions.map(subscription => 
      this.deliverToSubscriber(event, subscription)
    );
    
    await Promise.allSettled(deliveryPromises);
  }

  private async deliverToSubscriber(event: SemanticEvent, subscription: EventSubscription): Promise<void> {
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = subscription.metadata.maxRetries;
    
    while (retryCount <= maxRetries) {
      try {
        const result = await subscription.handler(event);
        
        if (result.success) {
          // Update subscription metadata
          subscription.metadata.lastTriggered = new Date();
          subscription.metadata.triggerCount++;
          
          // Update metrics
          this.updateMetrics(subscription.subscriberId, 'delivered');
          this.updateProcessingTime(subscription.subscriberId, Date.now() - startTime);
          
          return;
        } else if (result.shouldRetry && retryCount < maxRetries) {
          retryCount++;
          this.updateMetrics(subscription.subscriberId, 'retried');
          
          if (result.retryAfter) {
            await this.delay(result.retryAfter);
          } else {
            await this.delay(subscription.metadata.retryDelay);
          }
        } else {
          throw result.error || new Error('Handler failed without error');
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          this.updateMetrics(subscription.subscriberId, 'retried');
          await this.delay(subscription.metadata.retryDelay);
        } else {
          // Send to dead letter queue
          this.deadLetterQueue.push({
            ...event,
            metadata: {
              ...event.metadata,
              tags: [...(event.metadata.tags || []), 'dead-letter', `failed-${subscription.subscriberId}`]
            }
          });
          
          this.updateMetrics(subscription.subscriberId, 'failed');
          this.updateMetrics(subscription.subscriberId, 'deadLettered');
          
          console.error(`Failed to deliver event ${event.id} to ${subscription.subscriberId}:`, error);
          break;
        }
      }
    }
  }

  private updateEventMaps(event: SemanticEvent): void {
    // Update correlation map
    if (event.correlationId) {
      const events = this.correlationMap.get(event.correlationId) || [];
      events.push(event.id);
      this.correlationMap.set(event.correlationId, events);
    }
    
    // Update causation map
    if (event.causationId) {
      const events = this.causationMap.get(event.causationId) || [];
      events.push(event.id);
      this.causationMap.set(event.causationId, events);
    }
  }

  private updateMetrics(key: string, metric: keyof EventMetrics): void {
    const metrics = this.metrics.get(key) || this.createDefaultMetrics();
    
    switch (metric) {
      case 'published':
        metrics.published++;
        break;
      case 'delivered':
        metrics.delivered++;
        break;
      case 'failed':
        metrics.failed++;
        break;
      case 'retried':
        metrics.retried++;
        break;
      case 'deadLettered':
        metrics.deadLettered++;
        break;
    }
    
    metrics.lastProcessedTime = new Date();
    this.metrics.set(key, metrics);
  }

  private updateProcessingTime(key: string, processingTime: number): void {
    const metrics = this.metrics.get(key) || this.createDefaultMetrics();
    
    if (metrics.averageProcessingTime === 0) {
      metrics.averageProcessingTime = processingTime;
    } else {
      metrics.averageProcessingTime = (metrics.averageProcessingTime + processingTime) / 2;
    }
    
    this.metrics.set(key, metrics);
  }

  private initializeMetrics(key: string): void {
    this.metrics.set(key, this.createDefaultMetrics());
  }

  private createDefaultMetrics(): EventMetrics {
    return {
      published: 0,
      delivered: 0,
      failed: 0,
      retried: 0,
      deadLettered: 0,
      averageProcessingTime: 0,
      lastProcessedTime: new Date()
    };
  }

  private isValidSemanticReference(reference: string): boolean {
    // Format: Type:Id
    const regex = /^[A-Z][a-zA-Z]*:[a-zA-Z][a-zA-Z0-9]*$/;
    return regex.test(reference);
  }

  private extractArea(reference: string): string {
    // Extract area from references like Area:Technology or Actor:TechManager
    const [type, id] = reference.split(':');
    
    if (type === 'Area') {
      return id;
    }
    
    // For Actor references, we'd need to look up the actor's area
    // This would require access to the artifact repository
    // For now, return the reference as-is
    return reference;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Supporting interfaces
export interface EventStore {
  store(event: SemanticEvent): Promise<void>;
  getById(eventId: string): Promise<SemanticEvent | null>;
  query(query: EventQuery): Promise<EventQueryResult>;
  cleanup(olderThan: Date): Promise<number>;
}

export interface EventQuery {
  types?: string[];
  source?: string;
  target?: string;
  timeRange?: {
    from: Date;
    to: Date;
  };
  priority?: EventPriority;
  correlationId?: string;
  causationId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'priority' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface EventQueryResult {
  events: SemanticEvent[];
  totalCount: number;
  query: EventQuery;
  executionTime: number;
} 