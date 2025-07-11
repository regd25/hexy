/**
 * SemanticEngine Unit Tests
 * Tests for the core semantic interpretation and orchestration functionality
 */

import { SemanticEngine } from "../../engine/SemanticEngine"
import { ExecutionContext } from "../../context/ExecutionContext"
import { ArtifactRepository } from "../../repositories/ArtifactRepository"
import { ValidationSystem } from "../../validation/ValidationSystem"
import { PluginManager } from "../../plugins/PluginManager"
import { EventSystem, EventPriority } from "../../events/EventSystem"
import { OrchestrationMode } from "../../types/OrchestrationMode"
import { SOLArtifact, OperationalArtifact } from "../../artifacts/SOLArtifact"
import { SemanticDecision } from "../../types/SemanticDecision"
import { ValidationError, ValidationResult } from "../../types/ValidationResult"

// Mock dependencies
jest.mock("../../repositories/ArtifactRepository")
jest.mock("../../validation/ValidationSystem")
jest.mock("../../plugins/PluginManager")
jest.mock("../../events/EventSystem")

describe("SemanticEngine", () => {
  let semanticEngine: SemanticEngine
  let mockArtifactRepository: jest.Mocked<ArtifactRepository>
  let mockValidationSystem: jest.Mocked<ValidationSystem>
  let mockPluginManager: jest.Mocked<PluginManager>
  let mockEventSystem: jest.Mocked<EventSystem>
  let mockExecutionContext: ExecutionContext
  let mockArtifact: SOLArtifact
  let mockValidationResult: ValidationResult

  beforeEach(() => {
    // Initialize mocks - Create mock objects instead of instances
    mockArtifactRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findByType: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByReference: jest.fn(),
      findDependencies: jest.fn(),
      findDependents: jest.fn(),
      findByTag: jest.fn(),
      findByAuthor: jest.fn(),
      findByComposition: jest.fn(),
      findByOrganizationalLevel: jest.fn(),
      findByArea: jest.fn(),
      findExecutableArtifacts: jest.fn(),
      findInvalidArtifacts: jest.fn(),
      updateValidationResult: jest.fn(),
      findByValidationStatus: jest.fn(),
      getVersionHistory: jest.fn(),
      createVersion: jest.fn(),
      saveBatch: jest.fn(),
      validateBatch: jest.fn(),
      search: jest.fn(),
      reindex: jest.fn(),
      cleanup: jest.fn(),
      getStatistics: jest.fn(),
      findByReferences: jest.fn(),
    } as jest.Mocked<ArtifactRepository>

    mockValidationSystem = {
      validateArtifact: jest.fn(),
      validateArtifacts: jest.fn(),
      addCustomRule: jest.fn(),
      removeCustomRule: jest.fn(),
      getRulesByCategory: jest.fn(),
      toggleRule: jest.fn(),
    } as Partial<ValidationSystem> as jest.Mocked<ValidationSystem>

    mockPluginManager = {
      getPlugin: jest.fn(),
      loadPlugin: jest.fn(),
      unloadPlugin: jest.fn(),
      listPlugins: jest.fn(),
      isPluginLoaded: jest.fn(),
      getPluginInfo: jest.fn(),
      enablePlugin: jest.fn(),
      disablePlugin: jest.fn(),
      refreshPlugins: jest.fn(),
    } as Partial<PluginManager> as jest.Mocked<PluginManager>

    mockEventSystem = {
      publish: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getSubscription: jest.fn(),
      getSubscriptionsForSubscriber: jest.fn(),
      getCorrelationChain: jest.fn(),
      getCausationChain: jest.fn(),
      queryEvents: jest.fn(),
      getMetrics: jest.fn(),
      getDeadLetterQueue: jest.fn(),
      replayDeadLetterEvents: jest.fn(),
      validateCrossAreaCommunication: jest.fn(),
      emit: jest.fn(),
    } as Partial<EventSystem> as jest.Mocked<EventSystem>

    // Create SemanticEngine instance
    semanticEngine = new SemanticEngine(
      mockArtifactRepository,
      mockValidationSystem,
      mockPluginManager,
      mockEventSystem
    )

    // Setup mock artifacts and context
    mockArtifact = createMockArtifact()
    mockExecutionContext = createMockExecutionContext()
    mockValidationResult = createMockValidationResult(true)

    // Setup default mock implementations
    mockValidationSystem.validateArtifact.mockResolvedValue(
      mockValidationResult
    )
    mockArtifactRepository.findById.mockResolvedValue(null)
    mockPluginManager.getPlugin.mockReturnValue({
      execute: jest.fn().mockResolvedValue(mockExecutionContext),
    } as any)
    mockEventSystem.publish.mockResolvedValue()
    mockEventSystem.subscribe.mockResolvedValue()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("interpretArtifact", () => {
    it("should successfully interpret a valid artifact", async () => {
      // Arrange
      const expectedStrategy = "sequential-flow"

      // Act
      const result = await semanticEngine.interpretArtifact(
        mockArtifact,
        mockExecutionContext
      )

      // Assert
      expect(result).toBeDefined()
      expect(result.artifact).toBe(mockArtifact)
      expect(result.executionStrategy).toBe(expectedStrategy)
      expect(result.validationResult).toBe(mockValidationResult)
      expect(result.confidence).toBe(0.95)
      expect(result.reasoning).toContain(
        `Semantic interpretation based on ${mockArtifact.type} artifact structure`
      )
      expect(result.timestamp).toBeInstanceOf(Date)
      expect(mockValidationSystem.validateArtifact).toHaveBeenCalledWith(
        mockArtifact
      )
    })

    it("should throw error when artifact validation fails", async () => {
      // Arrange
      const invalidValidationResult = createMockValidationResult(false, [
        {
          message: "Semantic validation error",
          severity: "critical",
          code: "SEMANTIC_VALIDATION_ERROR",
          rule: "test-rule",
        },
      ])
      mockValidationSystem.validateArtifact.mockResolvedValue(
        invalidValidationResult
      )

      // Act & Assert
      await expect(
        semanticEngine.interpretArtifact(mockArtifact, mockExecutionContext)
      ).rejects.toThrow("Semantic validation failed: Semantic validation error")
    })

    it("should identify required plugins based on artifact tags", async () => {
      // Arrange
      const artifactWithTags = {
        ...mockArtifact,
        metadata: {
          ...mockArtifact.metadata,
          tags: ["aws", "jira"],
        },
      }

      // Act
      const result = await semanticEngine.interpretArtifact(
        artifactWithTags,
        mockExecutionContext
      )

      // Assert
      expect(result.requiredPlugins).toContain("aws-step-functions")
      expect(result.requiredPlugins).toContain("jira-integration")
    })

    it("should resolve semantic references from artifact", async () => {
      // Arrange
      const referencedArtifact = createMockArtifact("referenced-artifact-id")
      const artifactWithReferences = {
        ...mockArtifact,
        uses: {
          intent: "intent-id",
          context: "context-id",
          authority: "authority-id",
          evaluation: "evaluation-id",
        },
      }

      mockArtifactRepository.findById.mockImplementation(async (id: string) => {
        if (id === "intent-id") return referencedArtifact
        return null
      })

      // Act
      const result = await semanticEngine.interpretArtifact(
        artifactWithReferences,
        mockExecutionContext
      )

      // Assert
      expect(result.semanticReferences).toBeDefined()
      expect(mockArtifactRepository.findById).toHaveBeenCalledWith("intent-id")
    })

    it("should determine correct execution strategy based on artifact type", async () => {
      // Arrange - Test different artifact types
      const processArtifact = { ...mockArtifact, type: "Process" as const }
      const eventArtifact = { ...mockArtifact, type: "Event" as const }
      const policyArtifact = { ...mockArtifact, type: "Policy" as const }

      // Act & Assert - Process
      const processResult = await semanticEngine.interpretArtifact(
        processArtifact,
        mockExecutionContext
      )
      expect(processResult.executionStrategy).toBe("sequential-flow")

      // Act & Assert - Event
      const eventResult = await semanticEngine.interpretArtifact(
        eventArtifact,
        mockExecutionContext
      )
      expect(eventResult.executionStrategy).toBe("event-driven")

      // Act & Assert - Policy
      const policyResult = await semanticEngine.interpretArtifact(
        policyArtifact,
        mockExecutionContext
      )
      expect(policyResult.executionStrategy).toBe("validation-only")
    })
  })

  describe("orchestrate", () => {
    let mockDecision: SemanticDecision

    beforeEach(() => {
      mockDecision = createMockSemanticDecision()
    })

    it("should orchestrate execution in ORCHESTRATOR mode", async () => {
      // Arrange
      const mode = OrchestrationMode.ORCHESTRATOR

      // Act
      const result = await semanticEngine.orchestrate(
        mockDecision,
        mockExecutionContext,
        mode
      )

      // Assert
      expect(result).toBeInstanceOf(ExecutionContext)
      expect(mockExecutionContext.updateSemanticState).toHaveBeenCalledWith({
        currentArtifact: mockDecision.artifact,
        orchestrationMode: OrchestrationMode.ORCHESTRATOR,
        startTime: expect.any(Date),
      })
    })

    it("should orchestrate execution in REACTIVE mode", async () => {
      // Arrange
      const mode = OrchestrationMode.REACTIVE

      // Act
      const result = await semanticEngine.orchestrate(
        mockDecision,
        mockExecutionContext,
        mode
      )

      // Assert
      expect(result).toBeInstanceOf(ExecutionContext)
      expect(mockEventSystem.subscribe).toHaveBeenCalled()

      // Verify subscription was called with correct parameters
      const subscribeCall = mockEventSystem.subscribe.mock.calls[0][0]
      expect(subscribeCall.subscriberId).toBe(
        mockExecutionContext.getActor().metadata.id
      )
      expect(subscribeCall.isActive).toBe(true)
    })

    it("should orchestrate execution in CHOREOGRAPHED mode", async () => {
      // Arrange
      const mode = OrchestrationMode.CHOREOGRAPHED
      const operationalArtifact = createMockOperationalArtifact()
      const choreographedDecision = {
        ...mockDecision,
        artifact: operationalArtifact,
      }

      // Act
      const result = await semanticEngine.orchestrate(
        choreographedDecision,
        mockExecutionContext,
        mode
      )

      // Assert
      expect(result).toBeInstanceOf(ExecutionContext)
      expect(mockEventSystem.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "choreography.initiated",
          source: "semantic-engine",
        })
      )
    })

    it("should throw error for unsupported orchestration mode", async () => {
      // Arrange
      const invalidMode = "INVALID_MODE" as OrchestrationMode

      // Act & Assert
      await expect(
        semanticEngine.orchestrate(
          mockDecision,
          mockExecutionContext,
          invalidMode
        )
      ).rejects.toThrow("Unsupported orchestration mode: INVALID_MODE")
    })

    it("should execute plugins in orchestrator mode", async () => {
      // Arrange
      const mockPlugin = {
        execute: jest.fn().mockResolvedValue(mockExecutionContext),
      }
      mockPluginManager.getPlugin.mockReturnValue(mockPlugin as any)
      mockDecision.requiredPlugins = ["test-plugin"]

      // Act
      await semanticEngine.orchestrate(
        mockDecision,
        mockExecutionContext,
        OrchestrationMode.ORCHESTRATOR
      )

      // Assert
      expect(mockPluginManager.getPlugin).toHaveBeenCalledWith("test-plugin")
      expect(mockPlugin.execute).toHaveBeenCalledWith(mockExecutionContext)
    })

    it("should handle choreographed mode with operational artifact flow", async () => {
      // Arrange
      const operationalArtifact = createMockOperationalArtifact()
      const choreographedDecision = {
        ...mockDecision,
        artifact: operationalArtifact,
      }

      // Act
      await semanticEngine.orchestrate(
        choreographedDecision,
        mockExecutionContext,
        OrchestrationMode.CHOREOGRAPHED
      )

      // Assert
      expect(mockEventSystem.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "choreography.initiated",
          payload: expect.objectContaining({
            artifactId: operationalArtifact.metadata.id,
            plan: expect.objectContaining({
              steps: expect.any(Array),
              participants: expect.any(Array),
              coordinationEvents: expect.any(Array),
            }),
          }),
        })
      )
    })
  })

  describe("integration scenarios", () => {
    it("should handle complete interpretation and orchestration flow", async () => {
      // Arrange
      const operationalArtifact = createMockOperationalArtifact()

      // Act
      const decision = await semanticEngine.interpretArtifact(
        operationalArtifact,
        mockExecutionContext
      )
      const result = await semanticEngine.orchestrate(
        decision,
        mockExecutionContext,
        OrchestrationMode.ORCHESTRATOR
      )

      // Assert
      expect(decision).toBeDefined()
      expect(result).toBeInstanceOf(ExecutionContext)
      expect(mockValidationSystem.validateArtifact).toHaveBeenCalledWith(
        operationalArtifact
      )
    })

    it("should handle reactive mode event handling", async () => {
      // Arrange
      const decision = await semanticEngine.interpretArtifact(
        mockArtifact,
        mockExecutionContext
      )

      // Act
      await semanticEngine.orchestrate(
        decision,
        mockExecutionContext,
        OrchestrationMode.REACTIVE
      )

      // Assert
      expect(mockEventSystem.subscribe).toHaveBeenCalled()

      // Verify the subscription handler works
      const subscription = mockEventSystem.subscribe.mock.calls[0][0]
      const mockEvent = createMockSemanticEvent()
      const handlerResult = await subscription.handler(mockEvent)
      expect(handlerResult.success).toBe(true)
    })
  })
})

// Helper functions to create mock objects
function createMockArtifact(id: string = "test-artifact-id"): SOLArtifact {
  return {
    type: "Process",
    metadata: {
      id,
      version: "1.0.0",
      created: new Date(),
      lastModified: new Date(),
      status: "active",
      author: "test-author",
      reviewedBy: [],
      tags: [],
    },
    content: {},
    organizational: {
      level: "operational",
    },
  }
}

function createMockOperationalArtifact(): OperationalArtifact {
  return {
    type: "Process",
    metadata: {
      id: "operational-artifact-id",
      version: "1.0.0",
      created: new Date(),
      lastModified: new Date(),
      status: "active",
      author: "test-author",
      reviewedBy: [],
      tags: [],
    },
    uses: {
      intent: "intent-id",
      context: "context-id",
      authority: "authority-id",
      evaluation: "evaluation-id",
    },
    content: {},
    organizational: {
      area: "test-area",
      level: "operational",
      canReference: [],
    },
    flow: {
      steps: [
        {
          id: "step-1",
          actor: "actor-1",
          action: "Test action",
          inputs: ["input1"],
          outputs: ["output1"],
        },
        {
          id: "step-2",
          actor: "actor-2",
          action: "Another action",
          inputs: ["output1"],
          outputs: ["final-output"],
        },
      ],
    },
  }
}

function createMockExecutionContext(): ExecutionContext {
  const mockActor = {
    metadata: {
      id: "test-actor-id",
      version: "1.0",
      created: new Date(),
      lastModified: new Date(),
      status: "active",
      author: "test",
      reviewedBy: [],
      tags: [],
    },
    name: "Test Actor",
    description: "Test actor description",
    area: "test-area",
    level: "operational" as const,
    type: "internal" as const,
    responsibilities: [],
    capabilities: [],
  }

  const mockIntent = {
    metadata: {
      id: "test-intent-id",
      version: "1.0",
      created: new Date(),
      lastModified: new Date(),
      status: "active",
      author: "test",
      reviewedBy: [],
      tags: [],
    },
    statement: "Test intent",
    mode: "declare" as const,
    priority: "medium" as const,
  }

  const mockContext = {
    metadata: {
      id: "test-context-id",
      version: "1.0",
      created: new Date(),
      lastModified: new Date(),
      status: "active",
      author: "test",
      reviewedBy: [],
      tags: [],
    },
    scope: "test-scope",
    stakeholders: ["test-actor-id"],
  }

  const mockAuthority = {
    metadata: {
      id: "test-authority-id",
      version: "1.0",
      created: new Date(),
      lastModified: new Date(),
      status: "active",
      author: "test",
      reviewedBy: [],
      tags: [],
    },
    role: "test-role",
    permissions: ["test-permission"],
    jurisdiction: ["test-jurisdiction"],
    isActive: true,
  }

  const context = new ExecutionContext(
    "test-execution-id",
    mockActor,
    mockIntent,
    mockContext,
    mockAuthority
  )

  // Add spy methods for testing
  jest.spyOn(context, "updateSemanticState")
  jest.spyOn(context, "getId")
  jest.spyOn(context, "getActor")
  jest.spyOn(context, "getContext")
  jest.spyOn(context, "getIntent")
  jest.spyOn(context, "clone")

  return context
}

function createMockValidationResult(
  isValid: boolean,
  errors: ValidationError[] = []
): ValidationResult {
  return {
    isValid,
    errors,
    warnings: [],
    timestamp: new Date(),
    score: 0.95,
    validator: "test-validator",
    suggestions: [],
  }
}

function createMockSemanticDecision(): SemanticDecision {
  return {
    artifact: createMockArtifact(),
    executionStrategy: "sequential-flow",
    requiredPlugins: ["test-plugin"],
    semanticReferences: {},
    validationResult: createMockValidationResult(true),
    confidence: 0.95,
    reasoning: ["Test reasoning"],
    timestamp: new Date(),
  }
}

function createMockSemanticEvent() {
  return {
    id: "test-event-id",
    type: "test.event",
    source: "test-source",
    timestamp: new Date(),
    payload: {},
    metadata: {
      version: "1.0",
      format: "json" as const,
      classification: "internal" as const,
    },
    context: "test-context-id",
    intent: "test-intent-id",
    priority: EventPriority.NORMAL,
    correlationId: "test-correlation-id",
  }
}
