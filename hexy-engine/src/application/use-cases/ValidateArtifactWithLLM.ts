import { SOLArtifact, SOLArtifactType } from '../../domain/entities/SOLArtifact'
import { Process } from '../../domain/entities/Process'
import { Policy } from '../../domain/entities/Policy'
import { Actor } from '../../domain/entities/Actor'
import { Result, ResultStatus } from '../../domain/entities/Result'
import { PersistencePort } from '../../ports/secondary/PersistencePort'
import { LLMValidationPort, LLMValidationResult, ValidationContext, ValidationScope, ValidationPriority } from '../../ports/secondary/LLMValidationPort'
import { EventBus, EventTypes } from '../../infrastructure/events/EventBus'

/**
 * Use case for validating SOL artifacts using LLM semantic analysis
 * Implements the ValidarArtefactoSOL process
 */
export class ValidateArtifactWithLLMUseCase {
  constructor(
    private readonly persistence: PersistencePort,
    private readonly llmValidation: LLMValidationPort,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Execute the ValidarArtefactoSOL process
   * Follows the steps defined in the SOL specification
   */
  public async execute(request: ValidateWithLLMRequest): Promise<ValidateWithLLMResponse> {
    if (!request.artifactId) {
      throw new ValidateWithLLMError('Artifact ID is required', 'INVALID_INPUT')
    }

    try {
      // Step 1: MotorHexy → Detectar tipo de artefacto (Process, Policy, Actor)
      const artifact = await this.detectArtifactType(request.artifactId)
      if (!artifact) {
        throw new ValidateWithLLMError(
          `Artifact with ID ${request.artifactId} not found`,
          'ARTIFACT_NOT_FOUND'
        )
      }

      this.eventBus.emit(EventTypes.ARTIFACT_VALIDATED, {
        artifactId: request.artifactId,
        step: 'artifact_detected',
        type: artifact.getType()
      })

      // Step 2: MotorHexy → Invocar ValidadorSemanticoLLM con artefacto en contexto
      const validationContext = await this.prepareValidationContext(artifact, request)
      
      this.eventBus.emit(EventTypes.PROCESS_STEP_EXECUTED, {
        processId: 'ValidarArtefactoSOL',
        step: 'llm_invocation_started',
        actor: 'MotorHexy'
      })

      // Step 3: ValidadorSemanticoLLM → Evaluar semántica (Policy: ValidacionSemanticaLLM)
      const llmResult = await this.invokeLLMValidation(artifact, validationContext)

      // Step 4: ValidadorSemanticoLLM → Emitir Signal o Result de aprobación o rechazo
      const finalResult = await this.processLLMResult(artifact, llmResult, request.initiator)

      this.eventBus.emit(EventTypes.RESULT_EMITTED, {
        resultId: finalResult.id,
        artifactId: request.artifactId,
        isApproved: finalResult.isSuccess()
      })

      return {
        success: finalResult.isSuccess(),
        artifactId: request.artifactId,
        artifactType: artifact.getType(),
        llmValidationResult: llmResult,
        finalResult,
        processingTime: llmResult.processingTime,
        confidence: llmResult.confidence
      }

    } catch (error) {
      if (error instanceof ValidateWithLLMError) {
        throw error
      }
      
      throw new ValidateWithLLMError(
        `Unexpected error during LLM validation: ${(error as Error).message}`,
        'VALIDATION_ERROR'
      )
    }
  }

  /**
   * Get validation metrics for monitoring
   */
  public async getValidationMetrics(timeRange: TimeRange): Promise<ValidationMetrics> {
    // Implementation for indicators: ValidacionesAceptadasPorUsuario, TiempoPromedioRespuestaLLM
    const validations = await this.persistence.findArtifacts({
      type: 'Result',
      createdAfter: timeRange.start,
      createdBefore: timeRange.end,
      limit: 1000
    })

    const llmValidations = validations.filter(v => 
      v.toJSON().issuedBy === 'ValidadorSemanticoLLM'
    )

    const acceptedValidations = llmValidations.filter(v => 
      (v as any).isSuccess()
    )

    const acceptanceRate = llmValidations.length > 0 
      ? (acceptedValidations.length / llmValidations.length) * 100 
      : 0

    const responseTimes = llmValidations.map(v => 
      (v.toJSON().data as any)?.processingTime || 0
    ).filter(time => time > 0)

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

    return {
      totalValidations: llmValidations.length,
      acceptedValidations: acceptedValidations.length,
      acceptanceRate,
      averageResponseTime,
      timeRange
    }
  }

  private async detectArtifactType(artifactId: string): Promise<SOLArtifact | undefined> {
    // Try to find the artifact in persistence
    const artifacts = await this.persistence.findArtifacts({
      text: artifactId,
      limit: 1
    })
    
    return artifacts.length > 0 ? artifacts[0] : undefined
  }

  private async prepareValidationContext(
    artifact: SOLArtifact, 
    request: ValidateWithLLMRequest
  ): Promise<ValidationContext> {
    // Get related artifacts for context
    const relatedArtifacts = await this.persistence.getArtifactsByVision(
      artifact.vision || 'DesarrolloProcesosOrganizacionalesConHexy'
    )

    // Convert string priority to enum
    let priorityEnum: ValidationPriority | undefined
    if (request.priority) {
      switch (request.priority) {
        case 'LOW': priorityEnum = ValidationPriority.LOW; break
        case 'NORMAL': priorityEnum = ValidationPriority.NORMAL; break
        case 'HIGH': priorityEnum = ValidationPriority.HIGH; break
        case 'CRITICAL': priorityEnum = ValidationPriority.CRITICAL; break
        default: priorityEnum = ValidationPriority.NORMAL
      }
    }

    const context: ValidationContext = {
      domainId: 'HexyEngine',
      relatedArtifacts,
      validationScope: request.scope || ValidationScope.COMPREHENSIVE,
      timeout: request.timeout || 5000
    }

    // Only add visionContext if it exists
    if (artifact.vision) {
      context.visionContext = artifact.vision
    }

    // Only add priority if it exists  
    if (priorityEnum) {
      context.priority = priorityEnum
    }

    return context
  }

  private async invokeLLMValidation(
    artifact: SOLArtifact, 
    context: ValidationContext
  ): Promise<LLMValidationResult> {
    // Check if LLM is available
    const isAvailable = await this.llmValidation.isAvailable()
    if (!isAvailable) {
      throw new ValidateWithLLMError(
        'ValidadorSemanticoLLM is not available',
        'LLM_UNAVAILABLE'
      )
    }

    // Delegate to specific validation based on artifact type
    switch (artifact.getType()) {
      case SOLArtifactType.PROCESS:
        return await this.llmValidation.validateProcess(artifact as Process, context)
      
      case SOLArtifactType.POLICY:
        return await this.llmValidation.validatePolicy(artifact as Policy, context)
      
      case SOLArtifactType.ACTOR:
        return await this.llmValidation.verifyActor(artifact as Actor, context)
      
      default:
        return await this.llmValidation.validateArtifact(artifact, context)
    }
  }

  private async processLLMResult(
    artifact: SOLArtifact,
    llmResult: LLMValidationResult,
    _initiator: string
  ): Promise<Result> {
    const resultId = `ValidationResult_${artifact.id}_${Date.now()}`
    const status = llmResult.isValid ? ResultStatus.SUCCESS : ResultStatus.FAILURE
    
    const outcome = llmResult.isValid 
      ? `Artifact ${artifact.id} passed LLM semantic validation with ${(llmResult.confidence * 100).toFixed(1)}% confidence`
      : `Artifact ${artifact.id} failed LLM semantic validation. Errors: ${llmResult.errors.map(e => e.message).join(', ')}`

    const reason = `ValidadorSemanticoLLM semantic evaluation: ${llmResult.reasoning}. Score: ${llmResult.semanticScore}/100`

    const result = new Result(
      resultId,
      'ValidadorSemanticoLLM',
      outcome,
      reason,
      new Date(),
      'ValidarArtefactoSOL',
      status,
      {
        artifactId: artifact.id,
        artifactType: artifact.getType(),
        llmResult,
        processingTime: llmResult.processingTime,
        confidence: llmResult.confidence,
        semanticScore: llmResult.semanticScore
      }
    )

    // Save the result
    await this.persistence.saveArtifact(result)

    return result
  }
}

// Interfaces and types
export interface ValidateWithLLMRequest {
  artifactId: string
  initiator: string
  scope?: ValidationScope
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  timeout?: number
}

export interface ValidateWithLLMResponse {
  success: boolean
  artifactId: string
  artifactType: SOLArtifactType
  llmValidationResult: LLMValidationResult
  finalResult: Result
  processingTime: number
  confidence: number
}

export interface ValidationMetrics {
  totalValidations: number
  acceptedValidations: number
  acceptanceRate: number // percentage
  averageResponseTime: number // milliseconds
  timeRange: TimeRange
}

export interface TimeRange {
  start: Date
  end: Date
}

export class ValidateWithLLMError extends Error {
  constructor(
    message: string,
    public readonly code: ValidateWithLLMErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ValidateWithLLMError'
  }
}

export type ValidateWithLLMErrorCode = 
  | 'INVALID_INPUT'
  | 'ARTIFACT_NOT_FOUND'
  | 'LLM_UNAVAILABLE'
  | 'VALIDATION_ERROR' 