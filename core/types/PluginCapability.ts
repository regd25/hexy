/**
 * Core Abstraction: PluginCapability
 * Plugin capability system for extensible plugin architecture
 * These interfaces remain stable regardless of how many plugins are added
 */

import { ExecutionContext } from "../context/ExecutionContext"
import { SOLArtifact } from "../artifacts"
import { ValidationResult } from "./Result"

/**
 * Plugin capability definition
 * Defines what a plugin can do
 */
export interface PluginCapability {
  /**
   * Unique identifier for this capability
   */
  readonly id: string

  /**
   * Human-readable name of the capability
   */
  readonly name: string

  /**
   * Description of what this capability does
   */
  readonly description: string

  /**
   * Version of this capability
   */
  readonly version: string

  /**
   * Required methods that must be implemented
   */
  readonly requiredMethods: string[]

  /**
   * Optional methods that can be implemented
   */
  readonly optionalMethods: string[]

  /**
   * Configuration schema for this capability
   */
  readonly configurationSchema?: any

  /**
   * Dependencies on other capabilities
   */
  readonly dependencies: string[]

  /**
   * Tags for categorizing this capability
   */
  readonly tags: string[]
}

/**
 * Plugin interface
 * Core interface that all plugins must implement
 */
export interface Plugin {
  /**
   * Unique identifier for this plugin
   */
  readonly id: string

  /**
   * Human-readable name of the plugin
   */
  readonly name: string

  /**
   * Description of what this plugin does
   */
  readonly description: string

  /**
   * Version of this plugin
   */
  readonly version: string

  /**
   * Author of this plugin
   */
  readonly author: string

  /**
   * Capabilities this plugin provides
   */
  readonly capabilities: PluginCapability[]

  /**
   * Configuration for this plugin
   */
  configuration: Record<string, any>

  /**
   * Initialize the plugin
   * @param config - Plugin configuration
   */
  initialize(config: Record<string, any>): Promise<void>

  /**
   * Execute a method on this plugin
   * @param method - Method name to execute
   * @param params - Parameters for the method
   * @param context - Execution context
   * @returns Result of the method execution
   */
  execute(
    method: string,
    params: any[],
    context: ExecutionContext
  ): Promise<any>

  /**
   * Check if this plugin supports a specific capability
   * @param capabilityId - The capability identifier
   * @returns True if the plugin supports the capability
   */
  supportsCapability(capabilityId: string): boolean

  /**
   * Get available methods for a capability
   * @param capabilityId - The capability identifier
   * @returns Array of available method names
   */
  getAvailableMethods(capabilityId: string): string[]

  /**
   * Validate an artifact (if the plugin supports validation)
   * @param artifact - The artifact to validate
   * @returns Validation result or undefined if not supported
   */
  validate?(artifact: SOLArtifact): Promise<ValidationResult | undefined>

  /**
   * Clean up resources when the plugin is destroyed
   */
  destroy(): Promise<void>

  /**
   * Get plugin health status
   * @returns Health status information
   */
  getHealthStatus(): PluginHealthStatus
}

/**
 * Plugin health status
 */
export interface PluginHealthStatus {
  /**
   * Overall health status
   */
  status: "healthy" | "degraded" | "unhealthy" | "initializing"

  /**
   * Detailed health information
   */
  details: {
    /**
     * Last successful execution time
     */
    lastSuccessTime?: Date

    /**
     * Last error time
     */
    lastErrorTime?: Date

    /**
     * Error count in the last hour
     */
    errorCount: number

    /**
     * Additional health metrics
     */
    metrics: Record<string, any>
  }
}

/**
 * Plugin capability registry
 * Manages plugin capabilities and provides plugin discovery
 */
export interface PluginCapabilityRegistry {
  /**
   * Register a plugin capability
   * @param capability - The capability to register
   */
  registerCapability(capability: PluginCapability): void

  /**
   * Register a plugin
   * @param plugin - The plugin to register
   */
  registerPlugin(plugin: Plugin): Promise<void>

  /**
   * Get a plugin by ID
   * @param pluginId - The plugin identifier
   * @returns The plugin or undefined if not found
   */
  getPlugin(pluginId: string): Plugin | undefined

  /**
   * Find plugins that support a specific capability
   * @param capabilityId - The capability identifier
   * @returns Array of plugins that support the capability
   */
  findPluginsWithCapability(capabilityId: string): Plugin[]

  /**
   * Execute a capability method
   * @param capabilityId - The capability identifier
   * @param method - The method name
   * @param params - Method parameters
   * @param context - Execution context
   * @returns Result of the method execution
   */
  executeCapability(
    capabilityId: string,
    method: string,
    params: any[],
    context: ExecutionContext
  ): Promise<any>

  /**
   * Get all registered capabilities
   * @returns Array of registered capabilities
   */
  getAllCapabilities(): PluginCapability[]

  /**
   * Get all registered plugins
   * @returns Array of registered plugins
   */
  getAllPlugins(): Plugin[]

  /**
   * Check if a capability is registered
   * @param capabilityId - The capability identifier
   * @returns True if the capability is registered
   */
  hasCapability(capabilityId: string): boolean

  /**
   * Unregister a plugin
   * @param pluginId - The plugin identifier
   * @returns True if the plugin was unregistered
   */
  unregisterPlugin(pluginId: string): Promise<boolean>

  /**
   * Get plugin metrics
   * @param pluginId - The plugin identifier
   * @returns Plugin metrics or undefined if not found
   */
  getPluginMetrics(pluginId: string): PluginMetrics | undefined
}

/**
 * Plugin execution metrics
 */
export interface PluginMetrics {
  /**
   * Plugin identifier
   */
  pluginId: string

  /**
   * Total number of executions
   */
  executionCount: number

  /**
   * Total execution time in milliseconds
   */
  totalExecutionTime: number

  /**
   * Average execution time in milliseconds
   */
  averageExecutionTime: number

  /**
   * Number of successful executions
   */
  successCount: number

  /**
   * Number of failed executions
   */
  failureCount: number

  /**
   * Success rate (0-1)
   */
  successRate: number

  /**
   * Last execution timestamp
   */
  lastExecutionTime: Date

  /**
   * Capability-specific metrics
   */
  capabilityMetrics: Record<string, any>
}
