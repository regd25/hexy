/**
 * Event System - Core event handling for Hexy Framework
 * Provides event-driven architecture for semantic operations
 */

export interface SemanticEvent {
  id: string
  type: string
  timestamp: Date
  source: string
  data: any
  metadata?: Record<string, any>
}

export enum EventPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export interface EventStore {
  store(event: SemanticEvent): Promise<void>
  getById(eventId: string): Promise<SemanticEvent | null>
  query(query: any): Promise<any>
  cleanup(olderThan: Date): Promise<number>
}

export interface EventBus {
  emit(event: string, data: any): void
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
}

export class EventSystem {
  private eventStore: EventStore
  private eventBus: EventBus

  constructor(eventStore: EventStore, eventBus: EventBus) {
    this.eventStore = eventStore
    this.eventBus = eventBus
  }

  async emitEvent(event: SemanticEvent): Promise<void> {
    await this.eventStore.store(event)
    this.eventBus.emit(event.type, event)
  }

  async getEvent(eventId: string): Promise<SemanticEvent | null> {
    return await this.eventStore.getById(eventId)
  }

  async queryEvents(query: any): Promise<any> {
    return await this.eventStore.query(query)
  }

  onEvent(eventType: string, callback: Function): void {
    this.eventBus.on(eventType, callback)
  }

  offEvent(eventType: string, callback: Function): void {
    this.eventBus.off(eventType, callback)
  }

  async cleanup(olderThan: Date): Promise<number> {
    return await this.eventStore.cleanup(olderThan)
  }
}
