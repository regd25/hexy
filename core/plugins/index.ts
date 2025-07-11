/**
 * Plugins Module Index
 * Exports all plugin-related components and utilities
 */

// Registry exports
export { PluginCapabilityRegistry } from "./PluginCapabilityRegistry"
export type {
  PluginCapabilityMatch,
  CapabilityRequirement,
  CapabilitySearchCriteria,
  CapabilityUsageMetrics,
  PluginUsageMetrics,
} from "./PluginCapabilityRegistry"

// Plugin implementations
export {
  NotificationPlugin,
  EMAIL_NOTIFICATION_CAPABILITY,
  SLACK_NOTIFICATION_CAPABILITY,
  WEBHOOK_NOTIFICATION_CAPABILITY,
} from "./NotificationPlugin"
export type {
  NotificationConfig,
  NotificationRequest,
  NotificationResult,
} from "./NotificationPlugin"

// Core plugin types (re-exported for convenience)
export type {
  Plugin,
  PluginCapability,
  PluginHealthStatus,
} from "../types/PluginCapability"

// Factory function for creating a pre-configured plugin registry
export function createDefaultPluginRegistry(): PluginCapabilityRegistry {
  const registry = new PluginCapabilityRegistry()

  // Register default capabilities
  registry.registerCapability(EMAIL_NOTIFICATION_CAPABILITY)
  registry.registerCapability(SLACK_NOTIFICATION_CAPABILITY)
  registry.registerCapability(WEBHOOK_NOTIFICATION_CAPABILITY)

  return registry
}

// Factory function for creating a notification plugin with default config
export function createNotificationPlugin(config?: any): NotificationPlugin {
  return new NotificationPlugin()
}

// Utility functions
export function getPluginCapabilityIds(plugin: Plugin): string[] {
  return plugin.capabilities.map((cap) => cap.id)
}

export function findPluginsByTag(
  registry: PluginCapabilityRegistry,
  tag: string
): Plugin[] {
  return registry
    .getAllPlugins()
    .filter((plugin) =>
      plugin.capabilities.some((cap) => cap.tags.includes(tag))
    )
}

export function getCapabilityDependencies(
  registry: PluginCapabilityRegistry,
  capabilityId: string
): PluginCapability[] {
  const capability = registry.getCapability(capabilityId)
  if (!capability) {
    return []
  }

  return capability.dependencies
    .map((depId) => registry.getCapability(depId))
    .filter((cap): cap is PluginCapability => cap !== undefined)
}
