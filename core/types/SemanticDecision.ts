/**
 * Semantic Decision Types
 * Represents the outcome of semantic interpretation and decision making
 */

import { SOLArtifact } from "../artifacts/SOLArtifact"
import { ValidationResult } from "./ValidationResult"

export interface SemanticDecision {
  artifact: SOLArtifact
  executionStrategy: string
  requiredPlugins: string[]
  semanticReferences: Record<string, SOLArtifact>
  validationResult: ValidationResult
  confidence: number
  reasoning: string[]
  alternatives?: SemanticDecision[]
  timestamp: Date
}

export interface DecisionContext {
  currentState: any
  availableResources: string[]
  constraints: string[]
  objectives: string[]
  riskTolerance: "low" | "medium" | "high"
}

export interface DecisionCriteria {
  performance: number
  reliability: number
  security: number
  cost: number
  maintainability: number
  weight: DecisionWeight
}

export interface DecisionWeight {
  performance: number
  reliability: number
  security: number
  cost: number
  maintainability: number
}

export interface DecisionOutcome {
  decision: SemanticDecision
  executionTime: number
  actualResults: any[]
  deviations: string[]
  lessons: string[]
}

export type DecisionStrategy =
  | "optimization"
  | "satisficing"
  | "elimination"
  | "consensus"
  | "expert-system"

export interface DecisionEngine {
  strategy: DecisionStrategy
  criteria: DecisionCriteria
  makeDecision(
    context: DecisionContext,
    options: SemanticDecision[]
  ): SemanticDecision
  evaluateDecision(decision: SemanticDecision, outcome: DecisionOutcome): number
}
