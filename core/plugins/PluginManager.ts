/**
 * Plugin Manager - Manages plugin lifecycle and execution
 * Provides extensibility through plugin architecture
 */

import { ExecutionContext } from "../context/ExecutionContext"
import { SOLArtifact } from "../artifacts"
import { ValidationResult } from "../types/Result"

export interface Plugin {
  readonly id: string
  readonly name: string
  readonly version: string
  readonly description: string
  readonly type: PluginType
  readonly capabilities: PluginCapability[]
  readonly dependencies: string[]
  readonly author: string
  readonly license: string

  // Lifecycle methods
  initialize(config: PluginConfig): Promise<void>
  execute(context: ExecutionContext): Promise<ExecutionContext>
  validate?(artifact: SOLArtifact): Promise<ValidationResult>
  cleanup(): Promise<void>

  // Plugin-specific methods
  supports(artifact: SOLArtifact): boolean
  getRequiredPermissions(): string[]
  getSchema?(): any
}

export enum PluginType {
  EXECUTION = "execution",
  VALIDATION = "validation",
  INTEGRATION = "integration",
  TRANSFORMATION = "transformation",
  MONITORING = "monitoring",
  STORAGE = "storage",
  COMMUNICATION = "communication",
  SECURITY = "security",
}

export enum PluginCapability {
  // Execution capabilities
  PROCESS_ORCHESTRATION = "process-orchestration",
  WORKFLOW_AUTOMATION = "workflow-automation",
  TASK_EXECUTION = "task-execution",

  // Integration capabilities
  API_INTEGRATION = "api-integration",
  DATABASE_INTEGRATION = "database-integration",
  MESSAGING_INTEGRATION = "messaging-integration",
  EXTERNAL_SYSTEM_INTEGRATION = "external-system-integration",

  // Validation capabilities
  SEMANTIC_VALIDATION = "semantic-validation",
  BUSINESS_RULE_VALIDATION = "business-rule-validation",
  COMPLIANCE_CHECK = "compliance-check",

  // Transformation capabilities
  DATA_TRANSFORMATION = "data-transformation",
  FORMAT_CONVERSION = "format-conversion",
  CONTENT_GENERATION = "content-generation",

  // Monitoring capabilities
  PERFORMANCE_MONITORING = "performance-monitoring",
  HEALTH_CHECK = "health-check",
  METRICS_COLLECTION = "metrics-collection",
  ALERTING = "alerting",
}

export interface PluginConfig {
  enabled: boolean
  settings: Record<string, any>
  permissions: string[]
  timeout: number
  retryConfig: {
    maxRetries: number
    backoffStrategy: "linear" | "exponential"
    baseDelay: number
  }
}

export interface PluginRegistry {
  plugins: Map<string, Plugin>
  configs: Map<string, PluginConfig>
  dependencies: Map<string, string[]>
  loadOrder: string[]
}

export interface PluginMetrics {
  executions: number
  successfulExecutions: number
  failedExecutions: number
  averageExecutionTime: number
  lastExecutionTime: Date
  totalExecutionTime: number
  errors: PluginError[]
}

export interface PluginError {
  timestamp: Date
  error: Error
  context: any
  severity: "low" | "medium" | "high" | "critical"
}

export class PluginManager {
  private registry: PluginRegistry
  private metrics: Map<string, PluginMetrics>
  private eventBus: EventBus
  private securityManager: PluginSecurityManager
  private logger: Logger

  constructor(
    eventBus: EventBus,
    securityManager: PluginSecurityManager,
    logger: Logger
  ) {
    this.registry = {
      plugins: new Map(),
      configs: new Map(),
      dependencies: new Map(),
      loadOrder: [],
    }
    this.metrics = new Map()
    this.eventBus = eventBus
    this.securityManager = securityManager
    this.logger = logger
  }

  /**
   * Register a plugin with the manager
   */
  async registerPlugin(plugin: Plugin, config: PluginConfig): Promise<void> {
    // Validate plugin
    this.validatePlugin(plugin)

    // Check security permissions
    await this.securityManager.validatePermissions(plugin, config.permissions)

    // Check dependencies
    await this.resolveDependencies(plugin)

    // Initialize plugin
    await plugin.initialize(config)

    // Store in registry
    this.registry.plugins.set(plugin.id, plugin)
    this.registry.configs.set(plugin.id, config)
    this.registry.dependencies.set(plugin.id, plugin.dependencies)

    // Initialize metrics
    this.initializeMetrics(plugin.id)

    // Update load order
    this.updateLoadOrder()

    this.logger.info(`Plugin registered: ${plugin.name} (${plugin.id})`)
    this.eventBus.emit("plugin-registered", { plugin, config })
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.registry.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`)
    }

    // Check if other plugins depend on this one
    const dependents = this.getDependents(pluginId)
    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister plugin ${pluginId}: depended on by ${dependents.join(
          ", "
        )}`
      )
    }

    // Cleanup plugin
    await plugin.cleanup()

    // Remove from registry
    this.registry.plugins.delete(pluginId)
    this.registry.configs.delete(pluginId)
    this.registry.dependencies.delete(pluginId)
    this.metrics.delete(pluginId)

    // Update load order
    this.updateLoadOrder()

    this.logger.info(`Plugin unregistered: ${pluginId}`)
    this.eventBus.emit("plugin-unregistered", { pluginId })
  }

  /**
   * Get a plugin by ID
   */
  getPlugin(pluginId: string): Plugin {
    const plugin = this.registry.plugins.get(pluginId)
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`)
    }
    return plugin
  }

  /**
   * Get plugins by type
   */
  getPluginsByType(type: PluginType): Plugin[] {
    return Array.from(this.registry.plugins.values()).filter(
      (plugin) => plugin.type === type
    )
  }

  /**
   * Get plugins by capability
   */
  getPluginsByCapability(capability: PluginCapability): Plugin[] {
    return Array.from(this.registry.plugins.values()).filter((plugin) =>
      plugin.capabilities.includes(capability)
    )
  }

  /**
   * Execute a plugin with context
   */
  async executePlugin(
    pluginId: string,
    context: ExecutionContext
  ): Promise<ExecutionContext> {
    const plugin = this.getPlugin(pluginId)
    const config = this.registry.configs.get(pluginId)

    if (!config?.enabled) {
      throw new Error(`Plugin ${pluginId} is disabled`)
    }

    const startTime = Date.now()

    try {
      // Security check
      await this.securityManager.checkExecutionPermissions(plugin, context)

      // Execute plugin
      const result = await this.executeWithTimeout(
        plugin,
        context,
        config.timeout
      )

      // Update metrics
      this.updateMetrics(pluginId, true, Date.now() - startTime)

      this.eventBus.emit("plugin-executed", {
        pluginId,
        success: true,
        duration: Date.now() - startTime,
      })

      return result
    } catch (error) {
      // Update metrics
      this.updateMetrics(pluginId, false, Date.now() - startTime, error)

      this.eventBus.emit("plugin-executed", {
        pluginId,
        success: false,
        error,
        duration: Date.now() - startTime,
      })

      throw error
    }
  }

  /**
   * Validate an artifact using validation plugins
   */
  async validateArtifact(artifact: SOLArtifact): Promise<ValidationResult[]> {
    const validationPlugins = this.getPluginsByType(
      PluginType.VALIDATION
    ).filter((plugin) => plugin.supports(artifact))

    const results: ValidationResult[] = []

    for (const plugin of validationPlugins) {
      if (plugin.validate) {
        try {
          const result = await plugin.validate(artifact)
          results.push(result)
        } catch (error) {
          this.logger.error(`Validation plugin ${plugin.id} failed:`, error)
          // Continue with other plugins
        }
      }
    }

    return results
  }

  /**
   * Get plugin metrics
   */
  getPluginMetrics(pluginId: string): PluginMetrics | undefined {
    return this.metrics.get(pluginId)
  }

  /**
   * Get all plugin metrics
   */
  getAllMetrics(): Map<string, PluginMetrics> {
    return new Map(this.metrics)
  }

  /**
   * Reload plugin configuration
   */
  async reloadPluginConfig(
    pluginId: string,
    newConfig: PluginConfig
  ): Promise<void> {
    const plugin = this.getPlugin(pluginId)

    // Cleanup current state
    await plugin.cleanup()

    // Initialize with new config
    await plugin.initialize(newConfig)

    // Update registry
    this.registry.configs.set(pluginId, newConfig)

    this.logger.info(`Plugin config reloaded: ${pluginId}`)
    this.eventBus.emit("plugin-config-reloaded", { pluginId, newConfig })
  }

  /**
   * Get system health including plugin status
   */
  getSystemHealth(): PluginSystemHealth {
    const plugins = Array.from(this.registry.plugins.values())
    const totalPlugins = plugins.length
    const enabledPlugins = plugins.filter(
      (p) => this.registry.configs.get(p.id)?.enabled
    ).length
    const failedPlugins = Array.from(this.metrics.values()).filter(
      (m) => m.failedExecutions > 0
    ).length

    return {
      totalPlugins,
      enabledPlugins,
      disabledPlugins: totalPlugins - enabledPlugins,
      failedPlugins,
      healthScore: this.calculateHealthScore(),
      lastUpdate: new Date(),
    }
  }

  // Private methods
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.id || !plugin.name || !plugin.version) {
      throw new Error("Plugin must have id, name, and version")
    }

    if (this.registry.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`)
    }
  }

  private async resolveDependencies(plugin: Plugin): Promise<void> {
    for (const depId of plugin.dependencies) {
      if (!this.registry.plugins.has(depId)) {
        throw new Error(
          `Plugin ${plugin.id} depends on ${depId} which is not registered`
        )
      }
    }
  }

  private getDependents(pluginId: string): string[] {
    const dependents: string[] = []

    for (const [id, dependencies] of this.registry.dependencies) {
      if (dependencies.includes(pluginId)) {
        dependents.push(id)
      }
    }

    return dependents
  }

  private updateLoadOrder(): void {
    // Topological sort based on dependencies
    const visited = new Set<string>()
    const loadOrder: string[] = []

    const visit = (pluginId: string) => {
      if (visited.has(pluginId)) return

      visited.add(pluginId)
      const dependencies = this.registry.dependencies.get(pluginId) || []

      for (const depId of dependencies) {
        visit(depId)
      }

      loadOrder.push(pluginId)
    }

    for (const pluginId of this.registry.plugins.keys()) {
      visit(pluginId)
    }

    this.registry.loadOrder = loadOrder
  }

  private initializeMetrics(pluginId: string): void {
    this.metrics.set(pluginId, {
      executions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: new Date(),
      totalExecutionTime: 0,
      errors: [],
    })
  }

  private updateMetrics(
    pluginId: string,
    success: boolean,
    duration: number,
    error?: any
  ): void {
    const metrics = this.metrics.get(pluginId)
    if (!metrics) return

    metrics.executions++
    metrics.lastExecutionTime = new Date()
    metrics.totalExecutionTime += duration
    metrics.averageExecutionTime =
      metrics.totalExecutionTime / metrics.executions

    if (success) {
      metrics.successfulExecutions++
    } else {
      metrics.failedExecutions++
      if (error) {
        metrics.errors.push({
          timestamp: new Date(),
          error,
          context: {},
          severity: "medium",
        })
      }
    }
  }

  private async executeWithTimeout(
    plugin: Plugin,
    context: ExecutionContext,
    timeout: number
  ): Promise<ExecutionContext> {
    const timeoutPromise = new Promise<ExecutionContext>((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `Plugin ${plugin.id} execution timed out after ${timeout}ms`
          )
        )
      }, timeout)
    })

    return Promise.race([plugin.execute(context), timeoutPromise])
  }

  private calculateHealthScore(): number {
    const allMetrics = Array.from(this.metrics.values())
    if (allMetrics.length === 0) return 100

    const successRates = allMetrics.map((m) =>
      m.executions > 0 ? m.successfulExecutions / m.executions : 1
    )

    const averageSuccessRate =
      successRates.reduce((a, b) => a + b, 0) / successRates.length
    return Math.round(averageSuccessRate * 100)
  }
}

// Supporting interfaces
export interface PluginSystemHealth {
  totalPlugins: number
  enabledPlugins: number
  disabledPlugins: number
  failedPlugins: number
  healthScore: number
  lastUpdate: Date
}

export interface EventBus {
  emit(event: string, data: any): void
  on(event: string, callback: (data: any) => void): void
  off(event: string, callback: (data: any) => void): void
}

export interface PluginSecurityManager {
  validatePermissions(plugin: Plugin, permissions: string[]): Promise<void>
  checkExecutionPermissions(
    plugin: Plugin,
    context: ExecutionContext
  ): Promise<void>
}

export interface Logger {
  info(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
}
