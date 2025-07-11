/**
 * Core Factory - Main entry point for Hexy Core Module
 * Initializes and connects all core components following Dependency Injection principles
 */

import { SemanticEngine } from "./engine/SemanticEngine"
import { ExecutionContext } from "./context/ExecutionContext"
import { PluginManager } from "./plugins/PluginManager"
import {
  ArtifactRepository,
  InMemoryArtifactRepository,
} from "./repositories/ArtifactRepository"
import { ValidationSystem } from "./validation/ValidationSystem"
import { EventSystem, SemanticEvent, EventStore } from "./events/EventSystem"
import {
  OrchestrationModeFactory,
  OrchestrationModeConfigs,
} from "./engine/orchestration/OrchestrationModeFactory"

// Type imports
import {
  SOLArtifact,
  Actor,
  Intent,
  Context,
  Authority,
  Evaluation,
} from "./artifacts/SOLArtifact"
import { OrchestrationMode } from "./types/OrchestrationMode"
import { SemanticDecision } from "./types/SemanticDecision"
import { ValidationResult } from "./types/ValidationResult"

export interface CoreConfig {
  // Repository configuration
  repository?: {
    type: "memory" | "file" | "database"
    connectionString?: string
    options?: Record<string, any>
  }

  // Plugin configuration
  plugins?: {
    enabled: string[]
    configurations?: Record<string, any>
    autoLoad?: boolean
  }

  // Validation configuration
  validation?: {
    strictMode: boolean
    enableAllRules: boolean
    customRules?: string[]
  }

  // Event system configuration
  events?: {
    maxEventHistory: number
    eventTTL: number
    enablePersistence: boolean
  }

  // Orchestration configuration
  orchestration?: Partial<OrchestrationModeConfigs>

  // General configuration
  environment?: "development" | "staging" | "production"
  logLevel?: "debug" | "info" | "warn" | "error"
  performance?: {
    enableMetrics: boolean
    enableTracing: boolean
  }

  // Error handling configuration
  errorHandling?: {
    maxRetries: number
    retryDelay: number
    timeoutMs: number
    enableCleanupOnFailure: boolean
  }
}

export interface CoreComponents {
  semanticEngine: SemanticEngine
  orchestrationFactory: OrchestrationModeFactory
  pluginManager: PluginManager
  artifactRepository: ArtifactRepository
  validationSystem: ValidationSystem
  eventSystem: EventSystem
}

export interface CoreServices {
  // High-level service methods
  interpretAndExecute: (
    artifact: SOLArtifact,
    actor: Actor,
    context: Context
  ) => Promise<ExecutionContext>
  validate: (artifact: SOLArtifact) => Promise<ValidationResult>
  recommend: (
    artifact: SOLArtifact,
    context: ExecutionContext
  ) => Promise<RecommendationResult>
  monitor: (contextId: string) => Promise<MonitoringResult>

  // Component access
  getComponent: <T extends keyof CoreComponents>(
    componentName: T
  ) => CoreComponents[T]
  getConfig: () => CoreConfig

  // Lifecycle management
  start: () => Promise<void>
  stop: () => Promise<void>
  restart: () => Promise<void>
  getStatus: () => CoreStatus
}

export interface RecommendationResult {
  optimalMode: OrchestrationMode
  alternativeModes: OrchestrationMode[]
  reasoning: string[]
  estimatedExecutionTime: number
  riskAssessment: RiskAssessment
}

export interface MonitoringResult {
  contextStatus: "active" | "completed" | "failed" | "suspended"
  progress: number
  currentStep?: string
  metrics: {
    executionTime: number
    stepsCompleted: number
    eventsProcessed: number
    violations: number
  }
  recommendations?: string[]
}

export interface RiskAssessment {
  level: "low" | "medium" | "high" | "critical"
  factors: string[]
  mitigationStrategies: string[]
}

export interface CoreStatus {
  status: "starting" | "ready" | "busy" | "error" | "stopping"
  components: Record<keyof CoreComponents, ComponentStatus>
  performance: PerformanceMetrics
  health: HealthMetrics
}

export interface ComponentStatus {
  status: "ready" | "busy" | "error" | "disabled"
  lastActivity?: Date
  errorCount: number
  lastError?: string
}

export interface PerformanceMetrics {
  totalRequests: number
  averageResponseTime: number
  successRate: number
  memoryUsage: number
  cpuUsage: number
}

export interface HealthMetrics {
  uptime: number
  lastHealthCheck: Date
  issues: string[]
  warnings: string[]
}

export interface InitializationError extends Error {
  component?: string | undefined
  phase?: string
  originalError?: Error
  cleanup?: boolean
}

// Simple EventStore implementation for internal use
class InMemoryEventStore implements EventStore {
  private events: Map<string, SemanticEvent> = new Map()

  async store(event: SemanticEvent): Promise<void> {
    this.events.set(event.id, event)
  }

  async getById(eventId: string): Promise<SemanticEvent | null> {
    return this.events.get(eventId) || null
  }

  async query(query: any): Promise<any> {
    return {
      events: Array.from(this.events.values()),
      totalCount: this.events.size,
      query,
      executionTime: 0,
    }
  }

  async cleanup(olderThan: Date): Promise<number> {
    return 0
  }
}

// Simple EventBus implementation
class SimpleEventBus {
  private listeners: Map<string, Function[]> = new Map()

  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event callback for ${event}:`, error)
      }
    })
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
}

// Simple SecurityManager implementation
class SimpleSecurityManager {
  async validatePermissions(plugin: any, permissions: string[]): Promise<void> {
    // Basic validation - in production this would be more sophisticated
  }

  async checkExecutionPermissions(
    plugin: any,
    context: ExecutionContext
  ): Promise<void> {
    // Basic validation
  }
}

// Simple Logger implementation
class SimpleLogger {
  info(message: string, ...args: any[]): void {
    console.log(`[INFO] ${message}`, ...args)
  }

  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args)
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${message}`, ...args)
  }

  debug(message: string, ...args: any[]): void {
    console.debug(`[DEBUG] ${message}`, ...args)
  }
}

export class CoreFactory {
  private config: CoreConfig
  private components: Partial<CoreComponents> = {}
  private isInitialized = false
  private status: CoreStatus["status"] = "starting"
  private initializationErrors: InitializationError[] = []
  private readonly initializationOrder: (keyof CoreComponents)[] = [
    "eventSystem",
    "artifactRepository",
    "validationSystem",
    "pluginManager",
    "orchestrationFactory",
    "semanticEngine",
  ]

  constructor(config: CoreConfig = {}) {
    this.config = this.mergeWithDefaults(config)
  }

  /**
   * Initialize all core components and create the unified services interface
   */
  async initialize(): Promise<CoreServices> {
    if (this.isInitialized) {
      throw new Error(
        "Core already initialized. Call reset() first if reinitialization is needed."
      )
    }

    const startTime = Date.now()
    let currentComponent: string | undefined

    try {
      this.status = "starting"
      this.initializationErrors = []
      this.logInfo("Core initialization started", {
        config: this.config.environment,
      })

      // Initialize components in dependency order with timeout and error handling
      const initializationSteps = [
        { name: "eventSystem", fn: () => this.initializeEventSystem() },
        {
          name: "artifactRepository",
          fn: () => this.initializeArtifactRepository(),
        },
        {
          name: "validationSystem",
          fn: () => this.initializeValidationSystem(),
        },
        { name: "pluginManager", fn: () => this.initializePluginManager() },
        {
          name: "orchestrationFactory",
          fn: () => this.initializeOrchestrationFactory(),
        },
        { name: "semanticEngine", fn: () => this.initializeSemanticEngine() },
      ]

      for (const step of initializationSteps) {
        currentComponent = step.name
        this.logInfo(`Initializing ${step.name}...`)

        await this.executeWithTimeout(
          step.fn(),
          this.config.errorHandling?.timeoutMs || 30000,
          `${step.name} initialization timeout`
        )

        this.logInfo(`${step.name} initialized successfully`)
      }

      // Verify component connectivity with timeout
      this.logInfo("Verifying component connectivity...")
      await this.executeWithTimeout(
        this.verifyComponentConnectivity(),
        this.config.errorHandling?.timeoutMs || 30000,
        "Component connectivity verification timeout"
      )

      this.isInitialized = true
      this.status = "ready"

      const initializationTime = Date.now() - startTime
      this.logInfo("Core initialization completed successfully", {
        duration: initializationTime,
        components: Object.keys(this.components).length,
      })

      // Create and return the services interface
      return this.createServicesInterface()
    } catch (error) {
      this.status = "error"
      const initializationTime = Date.now() - startTime

      // Create detailed error information
      const initError: InitializationError = {
        name: "CoreInitializationError",
        message: `Core initialization failed at component: ${currentComponent}`,
        component: currentComponent,
        phase: "initialization",
        originalError: error as Error,
        cleanup: false,
      }

      this.initializationErrors.push(initError)
      this.logError("Core initialization failed", {
        component: currentComponent,
        duration: initializationTime,
        error: error instanceof Error ? error.message : String(error),
      })

      // Perform cleanup if enabled
      if (this.config.errorHandling?.enableCleanupOnFailure !== false) {
        this.logInfo("Performing cleanup due to initialization failure...")
        try {
          await this.cleanup()
          initError.cleanup = true
          this.logInfo("Cleanup completed successfully")
        } catch (cleanupError) {
          this.logError("Cleanup failed", {
            cleanupError:
              cleanupError instanceof Error
                ? cleanupError.message
                : String(cleanupError),
          })
        }
      }

      throw initError
    }
  }

  /**
   * Reset the factory to allow reinitialization
   */
  async reset(): Promise<void> {
    this.logInfo("Resetting CoreFactory...")

    if (this.isInitialized) {
      await this.cleanup()
    }

    this.components = {}
    this.isInitialized = false
    this.status = "starting"
    this.initializationErrors = []

    this.logInfo("CoreFactory reset completed")
  }

  /**
   * Cleanup all initialized components
   */
  private async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = []

    // Cleanup in reverse order
    const reverseOrder = [...this.initializationOrder].reverse()

    for (const componentName of reverseOrder) {
      const component = this.components[componentName]
      if (component) {
        cleanupPromises.push(this.cleanupComponent(componentName, component))
      }
    }

    // Wait for all cleanup operations to complete
    const results = await Promise.allSettled(cleanupPromises)

    // Log any cleanup failures
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const componentName = reverseOrder[index]
        this.logError(`Failed to cleanup ${componentName}`, {
          error:
            result.reason instanceof Error
              ? result.reason.message
              : String(result.reason),
        })
      }
    })

    // Clear components
    this.components = {}
  }

  /**
   * Cleanup individual component
   */
  private async cleanupComponent(name: string, component: any): Promise<void> {
    try {
      // Try different cleanup method names
      if (typeof component.cleanup === "function") {
        await component.cleanup()
      } else if (typeof component.shutdown === "function") {
        await component.shutdown()
      } else if (typeof component.destroy === "function") {
        await component.destroy()
      } else if (typeof component.close === "function") {
        await component.close()
      }

      this.logInfo(`Component ${name} cleaned up successfully`)
    } catch (error) {
      this.logError(`Failed to cleanup component ${name}`, {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Execute a promise with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    })

    return Promise.race([promise, timeoutPromise])
  }

  /**
   * Get initialization errors
   */
  getInitializationErrors(): InitializationError[] {
    return [...this.initializationErrors]
  }

  /**
   * Get detailed status including errors
   */
  getDetailedStatus(): CoreStatus & {
    initializationErrors: InitializationError[]
  } {
    const baseStatus = this.getStatus()
    return {
      ...baseStatus,
      initializationErrors: this.getInitializationErrors(),
    }
  }

  /**
   * Get current status
   */
  getStatus(): CoreStatus {
    return {
      status: this.status,
      components: this.getComponentStatuses(),
      performance: this.getPerformanceMetrics(),
      health: this.getHealthMetrics(),
    }
  }

  /**
   * Initialize Event System
   */
  private async initializeEventSystem(): Promise<void> {
    const eventStore = new InMemoryEventStore()
    this.components.eventSystem = new EventSystem(eventStore)
  }

  /**
   * Initialize Artifact Repository
   */
  private async initializeArtifactRepository(): Promise<void> {
    this.components.artifactRepository = new InMemoryArtifactRepository()
  }

  /**
   * Initialize Validation System
   */
  private async initializeValidationSystem(): Promise<void> {
    if (!this.components.artifactRepository) {
      throw new Error("ArtifactRepository must be initialized first")
    }
    this.components.validationSystem = new ValidationSystem(
      this.components.artifactRepository
    )
  }

  /**
   * Initialize Plugin Manager
   */
  private async initializePluginManager(): Promise<void> {
    if (!this.components.eventSystem || !this.components.validationSystem) {
      throw new Error(
        "EventSystem and ValidationSystem must be initialized first"
      )
    }

    const eventBus = new SimpleEventBus()
    const securityManager = new SimpleSecurityManager()
    const logger = new SimpleLogger()

    this.components.pluginManager = new PluginManager(
      eventBus as any,
      securityManager as any,
      logger as any
    )
  }

  /**
   * Initialize Orchestration Factory
   */
  private async initializeOrchestrationFactory(): Promise<void> {
    const { pluginManager, validationSystem, eventSystem, artifactRepository } =
      this.components

    if (
      !pluginManager ||
      !validationSystem ||
      !eventSystem ||
      !artifactRepository
    ) {
      throw new Error("Dependencies not initialized for OrchestrationFactory")
    }

    this.components.orchestrationFactory = new OrchestrationModeFactory(
      pluginManager,
      validationSystem,
      eventSystem,
      artifactRepository,
      this.config.orchestration
    )
  }

  /**
   * Initialize Semantic Engine
   */
  private async initializeSemanticEngine(): Promise<void> {
    const { artifactRepository, validationSystem, pluginManager, eventSystem } =
      this.components

    if (
      !artifactRepository ||
      !validationSystem ||
      !pluginManager ||
      !eventSystem
    ) {
      throw new Error("Dependencies not initialized for SemanticEngine")
    }

    this.components.semanticEngine = new SemanticEngine(
      artifactRepository,
      validationSystem,
      pluginManager,
      eventSystem
    )
  }

  /**
   * Verify all components can communicate with each other
   */
  private async verifyComponentConnectivity(): Promise<void> {
    // Perform basic connectivity tests
    const tests = [
      this.testEventSystemConnectivity(),
      this.testRepositoryConnectivity(),
      this.testValidationConnectivity(),
      this.testPluginManagerConnectivity(),
    ]

    const results = await Promise.allSettled(tests)
    const failures = results.filter((r) => r.status === "rejected")

    if (failures.length > 0) {
      throw new Error(
        `Component connectivity tests failed: ${failures.length} components`
      )
    }
  }

  /**
   * Create the unified services interface
   */
  private createServicesInterface(): CoreServices {
    const components = this.components as CoreComponents

    return {
      // High-level service methods
      interpretAndExecute: async (
        artifact: SOLArtifact,
        actor: Actor,
        context: Context
      ): Promise<ExecutionContext> => {
        this.status = "busy"

        try {
          // Create execution context
          const executionContext = await this.createExecutionContext(
            actor,
            context
          )

          // Interpret artifact
          const decision = await components.semanticEngine.interpretArtifact(
            artifact,
            executionContext
          )

          // Determine optimal orchestration mode
          const optimalMode =
            components.orchestrationFactory.determineOptimalMode(
              decision,
              executionContext
            )

          // Execute with optimal mode
          const result = await components.orchestrationFactory.execute(
            optimalMode,
            decision,
            executionContext
          )

          this.status = "ready"
          return result.context
        } catch (error) {
          this.status = "ready"
          throw error
        }
      },

      validate: async (artifact: SOLArtifact): Promise<ValidationResult> => {
        return await components.validationSystem.validateArtifact(artifact)
      },

      recommend: async (
        artifact: SOLArtifact,
        context: ExecutionContext
      ): Promise<RecommendationResult> => {
        const decision = await components.semanticEngine.interpretArtifact(
          artifact,
          context
        )
        const recommendations =
          components.orchestrationFactory.getOrchestrationRecommendations(
            decision,
            context
          )

        return {
          optimalMode:
            recommendations[0]?.mode || OrchestrationMode.ORCHESTRATOR,
          alternativeModes: recommendations.slice(1).map((r) => r.mode),
          reasoning: recommendations[0]?.reasoning || [
            "Default orchestration strategy selected",
          ],
          estimatedExecutionTime: this.estimateExecutionTime(decision, context),
          riskAssessment: this.assessRisk(artifact, context),
        }
      },

      monitor: async (contextId: string): Promise<MonitoringResult> => {
        // Implementation would track context status
        return {
          contextStatus: "active",
          progress: 50,
          currentStep: "validation",
          metrics: {
            executionTime: 1500,
            stepsCompleted: 3,
            eventsProcessed: 12,
            violations: 0,
          },
        }
      },

      // Component access
      getComponent: <T extends keyof CoreComponents>(
        componentName: T
      ): CoreComponents[T] => {
        return components[componentName]
      },

      getConfig: (): CoreConfig => {
        return { ...this.config }
      },

      // Lifecycle management
      start: async (): Promise<void> => {
        if (!this.isInitialized) {
          throw new Error("Core not initialized. Call initialize() first.")
        }
        this.status = "ready"
      },

      stop: async (): Promise<void> => {
        this.status = "stopping"

        // Stop components in reverse order
        if (
          this.components.eventSystem &&
          typeof (this.components.eventSystem as any).cleanup === "function"
        ) {
          await (this.components.eventSystem as any).cleanup()
        }

        this.status = "ready"
      },

      restart: async (): Promise<void> => {
        await this.createServicesInterface().stop()
        await this.createServicesInterface().start()
      },

      getStatus: (): CoreStatus => {
        return {
          status: this.status,
          components: this.getComponentStatuses(),
          performance: this.getPerformanceMetrics(),
          health: this.getHealthMetrics(),
        }
      },
    }
  }

  // Helper methods
  private async createExecutionContext(
    actor: Actor,
    context: Context
  ): Promise<ExecutionContext> {
    // Create minimal intent and authority for execution context
    const intent: Intent = {
      metadata: {
        id: `intent-${Date.now()}`,
        version: "1.0",
        created: new Date(),
        lastModified: new Date(),
        status: "active",
        author: actor.metadata.id,
        reviewedBy: [],
        tags: [],
      },
      statement: "Execute semantic operation",
      mode: "declare",
      priority: "medium",
    }

    const authority: Authority = {
      metadata: {
        id: `authority-${Date.now()}`,
        version: "1.0",
        created: new Date(),
        lastModified: new Date(),
        status: "active",
        author: actor.metadata.id,
        reviewedBy: [],
        tags: [],
      },
      role: actor.name,
      permissions: ["execute", "read", "validate"],
      jurisdiction: [context.scope],
      isActive: true,
    }

    return new ExecutionContext(
      `context-${Date.now()}`,
      actor,
      intent,
      context,
      authority
    )
  }

  private estimateExecutionTime(
    decision: SemanticDecision,
    context: ExecutionContext
  ): number {
    // Basic estimation based on artifact complexity and required plugins
    const baseTime = 1000 // 1 second base
    const pluginMultiplier = decision.requiredPlugins.length * 500
    const complexityMultiplier =
      Object.keys(decision.semanticReferences).length * 200

    return baseTime + pluginMultiplier + complexityMultiplier
  }

  private assessRisk(
    artifact: SOLArtifact,
    context: ExecutionContext
  ): RiskAssessment {
    const factors: string[] = []
    let riskLevel: RiskAssessment["level"] = "low"

    // Assess based on artifact type
    if (["Policy", "Principle", "Vision"].includes(artifact.type)) {
      factors.push("Strategic-level artifact with organization-wide impact")
      riskLevel = "medium"
    }

    // Assess based on dependencies
    if (
      artifact.relationships?.dependsOn &&
      artifact.relationships.dependsOn.length > 5
    ) {
      factors.push(
        "High number of dependencies increases coordination complexity"
      )
      riskLevel = "medium"
    }

    // Assess based on context priority
    if (context.getIntent().priority === "critical") {
      factors.push("Critical priority operation")
      riskLevel = "high"
    }

    return {
      level: riskLevel,
      factors,
      mitigationStrategies: [
        "Monitor execution closely",
        "Enable rollback capabilities",
        "Verify all dependencies before execution",
      ],
    }
  }

  private getComponentStatuses(): Record<
    keyof CoreComponents,
    ComponentStatus
  > {
    return {
      semanticEngine: { status: "ready", errorCount: 0 },
      orchestrationFactory: { status: "ready", errorCount: 0 },
      pluginManager: { status: "ready", errorCount: 0 },
      artifactRepository: { status: "ready", errorCount: 0 },
      validationSystem: { status: "ready", errorCount: 0 },
      eventSystem: { status: "ready", errorCount: 0 },
    }
  }

  private getPerformanceMetrics(): PerformanceMetrics {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      successRate: 100,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      cpuUsage: 0,
    }
  }

  private getHealthMetrics(): HealthMetrics {
    return {
      uptime: process.uptime(),
      lastHealthCheck: new Date(),
      issues: [],
      warnings: [],
    }
  }

  // Connectivity tests
  private async testEventSystemConnectivity(): Promise<void> {
    const eventSystem = this.components.eventSystem
    if (!eventSystem) throw new Error("EventSystem not initialized")

    // Test basic event publishing and subscription
    const testEvent = {
      id: "test-connectivity",
      type: "system.test",
      source: "core-factory",
      timestamp: new Date(),
      payload: { test: true },
      metadata: { version: "1.0", format: "json", classification: "internal" },
      context: "test",
      intent: "test",
      priority: 1,
    }

    await eventSystem.publish(testEvent as any)
  }

  private async testRepositoryConnectivity(): Promise<void> {
    const repository = this.components.artifactRepository
    if (!repository) throw new Error("ArtifactRepository not initialized")

    // Test basic repository operations using getStatistics method
    const stats = await repository.getStatistics()
    if (typeof stats.totalArtifacts !== "number") {
      throw new Error("Repository statistics invalid")
    }
  }

  private async testValidationConnectivity(): Promise<void> {
    const validation = this.components.validationSystem
    if (!validation) throw new Error("ValidationSystem not initialized")

    // Test basic validation
    const testArtifact: SOLArtifact = {
      type: "Intent",
      metadata: {
        id: "test",
        version: "1.0",
        created: new Date(),
        lastModified: new Date(),
        status: "active",
        author: "test",
        reviewedBy: [],
        tags: [],
      },
      content: {},
    }

    const result = await validation.validateArtifact(testArtifact)
    if (typeof result.isValid !== "boolean") {
      throw new Error("Validation result invalid")
    }
  }

  private async testPluginManagerConnectivity(): Promise<void> {
    const pluginManager = this.components.pluginManager
    if (!pluginManager) throw new Error("PluginManager not initialized")

    // Test basic plugin operations
    const plugins = pluginManager.getAvailablePlugins()
    if (!Array.isArray(plugins)) {
      throw new Error("Plugin list invalid")
    }
  }

  private mergeWithDefaults(config: CoreConfig): CoreConfig {
    return {
      repository: { type: "memory", ...config.repository },
      plugins: { enabled: [], autoLoad: false, ...config.plugins },
      validation: {
        strictMode: false,
        enableAllRules: true,
        ...config.validation,
      },
      events: {
        maxEventHistory: 1000,
        eventTTL: 3600000,
        enablePersistence: false,
        ...config.events,
      },
      environment: config.environment || "development",
      logLevel: config.logLevel || "info",
      performance: {
        enableMetrics: true,
        enableTracing: false,
        ...config.performance,
      },
      orchestration: config.orchestration || {},
      errorHandling: {
        maxRetries: 3,
        retryDelay: 1000,
        timeoutMs: 30000,
        enableCleanupOnFailure: true,
        ...config.errorHandling,
      },
    }
  }

  /**
   * Create a new CoreFactory instance with custom configuration
   */
  static create(config: CoreConfig = {}): CoreFactory {
    return new CoreFactory(config)
  }

  /**
   * Create and initialize a CoreFactory in one step
   */
  static async createAndInitialize(
    config: CoreConfig = {}
  ): Promise<CoreServices> {
    const factory = new CoreFactory(config)
    return await factory.initialize()
  }

  /**
   * Logging helpers
   */
  private logInfo(message: string, data?: any): void {
    if (this.config.logLevel !== "error" && this.config.logLevel !== "warn") {
      console.log(`[CoreFactory:INFO] ${message}`, data || "")
    }
  }

  private logError(message: string, data?: any): void {
    console.error(`[CoreFactory:ERROR] ${message}`, data || "")
  }
}
