import { DomainEvent, EventBus, EventHandler, Subscription } from "./EventBus";

export class PluginEventBus implements EventBus {
  private readonly eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  async publish<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
    await this.eventBus.publish(event);
  }

  subscribe<TEvent extends DomainEvent>(
    eventName: TEvent["name"],
    handler: EventHandler<TEvent>
  ): Subscription {
    return this.eventBus.subscribe(eventName, handler);
  }
}
