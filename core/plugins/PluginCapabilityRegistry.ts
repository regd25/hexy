/**
 * Plugin Capability Registry
 * Manages plugin capabilities and enables capability-based plugin discovery
 */

import { PluginCapability, Plugin } from "../types/PluginCapability"
import { ExecutionContext } from "../context/ExecutionContext"
import { SOLArtifact } from "../artifacts"

export interface PluginCapabilityMatch {
  plugin: Plugin
  capability: PluginCapability
  score: number
  reasoning: string[]
}

export interface CapabilityRequirement {
  capabilityId: string
  required: boolean
  parameters?: Record<string, any>
  constraints?: Record<string, any>
}

export interface CapabilitySearchCriteria {
  requiredCapabilities: string[]
  optionalCapabilities?: string[]
  tags?: string[]
  minVersion?: string
  maxVersion?: string
  excludePlugins?: string[]
  includeOnlyPlugins?: string[]
}

export class PluginCapabilityRegistry {
  private capabilities = new Map<string, PluginCapability>()
  private plugins = new Map<string, Plugin>()
  private capabilityToPlugins = new Map<string, Set<string>>()
  private pluginToCapabilities = new Map<string, Set<string>>()
  private capabilityUsageMetrics = new Map<string, CapabilityUsageMetrics>()

  /**
   * Register a plugin capability
   */
  registerCapability(capability: PluginCapability): void {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability '${capability.id}' is already registered`)
    }

    // Validate capability
    this.validateCapability(capability)

    this.capabilities.set(capability.id, capability)
    this.capabilityToPlugins.set(capability.id, new Set())

    // Initialize usage metrics
    this.capabilityUsageMetrics.set(capability.id, {
      capabilityId: capability.id,
      totalUsage: 0,
      successfulUsage: 0,
      failedUsage: 0,
      averageExecutionTime: 0,
      lastUsed: new Date(),
      pluginUsage: new Map(),
    })
  }

  /**
   * Register a plugin and associate it with its capabilities
   */
  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin '${plugin.id}' is already registered`)
    }

    // Validate plugin capabilities
    for (const capability of plugin.capabilities) {
      if (!this.capabilities.has(capability.id)) {
        throw new Error(
          `Plugin '${plugin.id}' references unknown capability '${capability.id}'`
        )
      }
    }

    this.plugins.set(plugin.id, plugin)
    this.pluginToCapabilities.set(plugin.id, new Set())

    // Associate plugin with capabilities
    for (const capability of plugin.capabilities) {
      this.associatePluginWithCapability(plugin.id, capability.id)
    }
  }

  /**
   * Find plugins that match the given capability requirements
   */
  findPluginsByCapabilities(
    criteria: CapabilitySearchCriteria
  ): PluginCapabilityMatch[] {
    const matches: PluginCapabilityMatch[] = []

    for (const plugin of this.plugins.values()) {
      const match = this.evaluatePluginMatch(plugin, criteria)
      if (match) {
        matches.push(match)
      }
    }

    // Sort by score (highest first)
    return matches.sort((a, b) => b.score - a.score)
  }

  /**
   * Find the best plugin for a specific capability
   */
  findBestPluginForCapability(
    capabilityId: string,
    context?: ExecutionContext
  ): Plugin | undefined {
    const pluginIds = this.capabilityToPlugins.get(capabilityId)
    if (!pluginIds || pluginIds.size === 0) {
      return undefined
    }

    let bestPlugin: Plugin | undefined
    let bestScore = -1

    for (const pluginId of pluginIds) {
      const plugin = this.plugins.get(pluginId)
      if (!plugin) continue

      const score = this.calculatePluginScore(plugin, capabilityId, context)
      if (score > bestScore) {
        bestScore = score
        bestPlugin = plugin
      }
    }

    return bestPlugin
  }

  /**
   * Get all plugins that provide a specific capability
   */
  getPluginsForCapability(capabilityId: string): Plugin[] {
    const pluginIds = this.capabilityToPlugins.get(capabilityId)
    if (!pluginIds) {
      return []
    }

    return Array.from(pluginIds)
      .map((id) => this.plugins.get(id))
      .filter((plugin): plugin is Plugin => plugin !== undefined)
  }

  /**
   * Get all capabilities provided by a plugin
   */
  getCapabilitiesForPlugin(pluginId: string): PluginCapability[] {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return []
    }

    return plugin.capabilities
  }

  /**
   * Check if a capability is available
   */
  hasCapability(capabilityId: string): boolean {
    return this.capabilities.has(capabilityId)
  }

  /**
   * Check if a plugin is registered
   */
  hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId)
  }

  /**
   * Get capability by ID
   */
  getCapability(capabilityId: string): PluginCapability | undefined {
    return this.capabilities.get(capabilityId)
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Get all registered capabilities
   */
  getAllCapabilities(): PluginCapability[] {
    return Array.from(this.capabilities.values())
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Unregister a capability
   */
  unregisterCapability(capabilityId: string): boolean {
    if (!this.capabilities.has(capabilityId)) {
      return false
    }

    // Remove from all plugins
    const pluginIds = this.capabilityToPlugins.get(capabilityId)
    if (pluginIds) {
      for (const pluginId of pluginIds) {
        this.dissociatePluginFromCapability(pluginId, capabilityId)
      }
    }

    this.capabilities.delete(capabilityId)
    this.capabilityToPlugins.delete(capabilityId)
    this.capabilityUsageMetrics.delete(capabilityId)

    return true
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) {
      return false
    }

    // Remove from all capabilities
    const capabilityIds = this.pluginToCapabilities.get(pluginId)
    if (capabilityIds) {
      for (const capabilityId of capabilityIds) {
        this.dissociatePluginFromCapability(pluginId, capabilityId)
      }
    }

    this.plugins.delete(pluginId)
    this.pluginToCapabilities.delete(pluginId)

    return true
  }

  /**
   * Update usage metrics for a capability
   */
  updateUsageMetrics(
    capabilityId: string,
    pluginId: string,
    executionTime: number,
    success: boolean
  ): void {
    const metrics = this.capabilityUsageMetrics.get(capabilityId)
    if (!metrics) {
      return
    }

    metrics.totalUsage++
    metrics.lastUsed = new Date()

    if (success) {
      metrics.successfulUsage++
    } else {
      metrics.failedUsage++
    }

    // Update average execution time
    metrics.averageExecutionTime =
      (metrics.averageExecutionTime * (metrics.totalUsage - 1) +
        executionTime) /
      metrics.totalUsage

    // Update plugin-specific usage
    if (!metrics.pluginUsage.has(pluginId)) {
      metrics.pluginUsage.set(pluginId, {
        pluginId,
        usageCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0,
      })
    }

    const pluginMetrics = metrics.pluginUsage.get(pluginId)!
    pluginMetrics.usageCount++
    pluginMetrics.averageExecutionTime =
      (pluginMetrics.averageExecutionTime * (pluginMetrics.usageCount - 1) +
        executionTime) /
      pluginMetrics.usageCount

    if (success) {
      pluginMetrics.successCount++
    } else {
      pluginMetrics.failureCount++
    }
  }

  /**
   * Get usage metrics for a capability
   */
  getUsageMetrics(capabilityId: string): CapabilityUsageMetrics | undefined {
    return this.capabilityUsageMetrics.get(capabilityId)
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): {
    totalCapabilities: number
    totalPlugins: number
    totalUsage: number
    averageCapabilitiesPerPlugin: number
    averagePluginsPerCapability: number
    mostUsedCapability: string | null
    mostActivePlugin: string | null
  } {
    const totalCapabilities = this.capabilities.size
    const totalPlugins = this.plugins.size
    const totalUsage = Array.from(this.capabilityUsageMetrics.values()).reduce(
      (sum, m) => sum + m.totalUsage,
      0
    )

    const averageCapabilitiesPerPlugin =
      totalPlugins > 0
        ? Array.from(this.pluginToCapabilities.values()).reduce(
            (sum, caps) => sum + caps.size,
            0
          ) / totalPlugins
        : 0

    const averagePluginsPerCapability =
      totalCapabilities > 0
        ? Array.from(this.capabilityToPlugins.values()).reduce(
            (sum, plugins) => sum + plugins.size,
            0
          ) / totalCapabilities
        : 0

    const mostUsedCapability =
      Array.from(this.capabilityUsageMetrics.values()).reduce(
        (best: CapabilityUsageMetrics | null, current) =>
          current.totalUsage > (best?.totalUsage || 0) ? current : best,
        null as CapabilityUsageMetrics | null
      )?.capabilityId || null

    const mostActivePlugin =
      Array.from(this.plugins.values()).reduce(
        (best: Plugin | null, current) => {
          const currentUsage = current.capabilities.reduce((sum, cap) => {
            const metrics = this.capabilityUsageMetrics.get(cap.id)
            return sum + (metrics?.pluginUsage.get(current.id)?.usageCount || 0)
          }, 0)

          const bestUsage = best
            ? best.capabilities.reduce((sum, cap) => {
                const metrics = this.capabilityUsageMetrics.get(cap.id)
                return (
                  sum + (metrics?.pluginUsage.get(best.id)?.usageCount || 0)
                )
              }, 0)
            : 0

          return currentUsage > bestUsage ? current : best
        },
        null as Plugin | null
      )?.id || null

    return {
      totalCapabilities,
      totalPlugins,
      totalUsage,
      averageCapabilitiesPerPlugin,
      averagePluginsPerCapability,
      mostUsedCapability,
      mostActivePlugin,
    }
  }

  private validateCapability(capability: PluginCapability): void {
    if (!capability.id) {
      throw new Error("Capability must have an ID")
    }

    if (!capability.name) {
      throw new Error("Capability must have a name")
    }

    if (!capability.version) {
      throw new Error("Capability must have a version")
    }

    if (!Array.isArray(capability.requiredMethods)) {
      throw new Error("Capability must have required methods array")
    }

    // Validate dependencies exist
    for (const depId of capability.dependencies) {
      if (!this.capabilities.has(depId)) {
        throw new Error(
          `Capability '${capability.id}' depends on unknown capability '${depId}'`
        )
      }
    }
  }

  private associatePluginWithCapability(
    pluginId: string,
    capabilityId: string
  ): void {
    const pluginCapabilities = this.pluginToCapabilities.get(pluginId)
    if (pluginCapabilities) {
      pluginCapabilities.add(capabilityId)
    }

    const capabilityPlugins = this.capabilityToPlugins.get(capabilityId)
    if (capabilityPlugins) {
      capabilityPlugins.add(pluginId)
    }
  }

  private dissociatePluginFromCapability(
    pluginId: string,
    capabilityId: string
  ): void {
    const pluginCapabilities = this.pluginToCapabilities.get(pluginId)
    if (pluginCapabilities) {
      pluginCapabilities.delete(capabilityId)
    }

    const capabilityPlugins = this.capabilityToPlugins.get(capabilityId)
    if (capabilityPlugins) {
      capabilityPlugins.delete(pluginId)
    }
  }

  private evaluatePluginMatch(
    plugin: Plugin,
    criteria: CapabilitySearchCriteria
  ): PluginCapabilityMatch | null {
    let score = 0
    const reasoning: string[] = []

    // Check if plugin should be excluded
    if (criteria.excludePlugins?.includes(plugin.id)) {
      return null
    }

    // Check if plugin should be included
    if (
      criteria.includeOnlyPlugins &&
      !criteria.includeOnlyPlugins.includes(plugin.id)
    ) {
      return null
    }

    // Check required capabilities
    const pluginCapabilityIds = plugin.capabilities.map((c) => c.id)
    const hasAllRequired = criteria.requiredCapabilities.every((capId) =>
      pluginCapabilityIds.includes(capId)
    )

    if (!hasAllRequired) {
      return null
    }

    score += criteria.requiredCapabilities.length * 10
    reasoning.push(
      `Provides all ${criteria.requiredCapabilities.length} required capabilities`
    )

    // Check optional capabilities
    if (criteria.optionalCapabilities) {
      const optionalMatches = criteria.optionalCapabilities.filter((capId) =>
        pluginCapabilityIds.includes(capId)
      )
      score += optionalMatches.length * 5
      if (optionalMatches.length > 0) {
        reasoning.push(
          `Provides ${optionalMatches.length} optional capabilities`
        )
      }
    }

    // Check tags
    if (criteria.tags) {
      const pluginTags = plugin.capabilities.flatMap((c) => c.tags)
      const tagMatches = criteria.tags.filter((tag) => pluginTags.includes(tag))
      score += tagMatches.length * 2
      if (tagMatches.length > 0) {
        reasoning.push(`Matches ${tagMatches.length} tags`)
      }
    }

    // Find the best matching capability for scoring
    const bestCapability =
      plugin.capabilities.find((cap) =>
        criteria.requiredCapabilities.includes(cap.id)
      ) || plugin.capabilities[0]

    if (!bestCapability) {
      return null
    }

    return {
      plugin,
      capability: bestCapability,
      score,
      reasoning,
    }
  }

  private calculatePluginScore(
    plugin: Plugin,
    capabilityId: string,
    context?: ExecutionContext
  ): number {
    let score = 0

    // Base score for having the capability
    score += 10

    // Score based on usage metrics
    const metrics = this.capabilityUsageMetrics.get(capabilityId)
    if (metrics) {
      const pluginMetrics = metrics.pluginUsage.get(plugin.id)
      if (pluginMetrics) {
        // Higher score for more successful usage
        const successRate =
          pluginMetrics.successCount / pluginMetrics.usageCount
        score += successRate * 20

        // Higher score for faster execution
        if (pluginMetrics.averageExecutionTime < 1000) {
          score += 10
        } else if (pluginMetrics.averageExecutionTime < 5000) {
          score += 5
        }

        // Higher score for more experience
        if (pluginMetrics.usageCount > 100) {
          score += 15
        } else if (pluginMetrics.usageCount > 10) {
          score += 8
        }
      }
    }

    // Score based on plugin health
    const healthStatus = plugin.getHealthStatus()
    if (healthStatus.status === "healthy") {
      score += 10
    } else if (healthStatus.status === "degraded") {
      score += 5
    }

    return score
  }
}

export interface CapabilityUsageMetrics {
  capabilityId: string
  totalUsage: number
  successfulUsage: number
  failedUsage: number
  averageExecutionTime: number
  lastUsed: Date
  pluginUsage: Map<string, PluginUsageMetrics>
}

export interface PluginUsageMetrics {
  pluginId: string
  usageCount: number
  successCount: number
  failureCount: number
  averageExecutionTime: number
}
