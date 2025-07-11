/**
 * Strategic Artifacts - SOL artifacts for strategic planning and governance
 * Contains Vision, Policy, Concept, Principle, Guideline, and Indicator artifacts
 */

import {
  SOLArtifact,
  SOLArtifactUses,
  SOLArtifactOrganizational,
  SOLArtifactRelationships,
  Metadata,
} from "./BaseArtifact"

// ============================================================================
// STRATEGIC ARTIFACT CONTENT SCHEMAS
// ============================================================================

export interface VisionContent {
  statement: string
  timeHorizon: string
  stakeholders: string[]
  objectives: string[]
  successIndicators: string[]
  challenges?: string[]
}

export interface PolicyContent {
  title: string
  statement: string
  scope: string[]
  rules: PolicyRule[]
  exceptions?: PolicyException[]
  enforcement: {
    authority: string
    penalties: string[]
    appeals: string
  }
}

export interface PolicyRule {
  id: string
  rule: string
  mandatory: boolean
  conditions?: string[]
  rationale?: string
}

export interface PolicyException {
  id: string
  condition: string
  alternativeAction: string
  approvalRequired?: string
}

export interface ConceptContent {
  name: string
  definition: string
  description: string
  properties: string[]
  relationships?: string[]
  examples?: string[]
  references?: string[]
}

export interface PrincipleContent {
  name: string
  statement: string
  rationale: string
  scope: string[]
  implications: string[]
  exceptions?: string[]
  references?: string[]
}

export interface GuidelineContent {
  name: string
  description: string
  recommendations: string[]
  bestPractices: string[]
  avoidances?: string[]
  applicability: string[]
  examples?: string[]
}

export interface IndicatorContent {
  name: string
  description: string
  metric: string
  unit: string
  target: number
  baseline?: number
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  source: string
  calculation?: string
}

// ============================================================================
// STRATEGIC ARTIFACT INTERFACES
// ============================================================================

export interface VisionArtifact extends SOLArtifact<"Vision"> {
  type: "Vision"
  content: VisionContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "strategic"
  }
}

export interface PolicyArtifact extends SOLArtifact<"Policy"> {
  type: "Policy"
  content: PolicyContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "strategic"
  }
}

export interface ConceptArtifact extends SOLArtifact<"Concept"> {
  type: "Concept"
  content: ConceptContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "strategic"
  }
}

export interface PrincipleArtifact extends SOLArtifact<"Principle"> {
  type: "Principle"
  content: PrincipleContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "strategic"
  }
}

export interface GuidelineArtifact extends SOLArtifact<"Guideline"> {
  type: "Guideline"
  content: GuidelineContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "strategic"
  }
}

export interface IndicatorArtifact extends SOLArtifact<"Indicator"> {
  type: "Indicator"
  content: IndicatorContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational> & {
    level: "strategic"
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isVisionArtifact(
  artifact: SOLArtifact
): artifact is VisionArtifact {
  return artifact.type === "Vision"
}

export function isPolicyArtifact(
  artifact: SOLArtifact
): artifact is PolicyArtifact {
  return artifact.type === "Policy"
}

export function isConceptArtifact(
  artifact: SOLArtifact
): artifact is ConceptArtifact {
  return artifact.type === "Concept"
}

export function isPrincipleArtifact(
  artifact: SOLArtifact
): artifact is PrincipleArtifact {
  return artifact.type === "Principle"
}

export function isGuidelineArtifact(
  artifact: SOLArtifact
): artifact is GuidelineArtifact {
  return artifact.type === "Guideline"
}

export function isIndicatorArtifact(
  artifact: SOLArtifact
): artifact is IndicatorArtifact {
  return artifact.type === "Indicator"
}

export function isStrategicArtifact(
  artifact: SOLArtifact
): artifact is
  | VisionArtifact
  | PolicyArtifact
  | ConceptArtifact
  | PrincipleArtifact
  | GuidelineArtifact
  | IndicatorArtifact {
  return [
    "Vision",
    "Policy",
    "Concept",
    "Principle",
    "Guideline",
    "Indicator",
  ].includes(artifact.type)
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createVisionArtifact(
  metadata: Metadata,
  content: VisionContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & { level: "strategic" },
  relationships?: SOLArtifactRelationships
): VisionArtifact {
  return {
    type: "Vision",
    metadata,
    content,
    uses,
    organizational,
    ...(relationships && { relationships }),
    isValid: false,
    isExecutable: false,
  }
}

export function createPolicyArtifact(
  metadata: Metadata,
  content: PolicyContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & { level: "strategic" },
  relationships?: SOLArtifactRelationships
): PolicyArtifact {
  return {
    type: "Policy",
    metadata,
    content,
    uses,
    organizational,
    ...(relationships && { relationships }),
    isValid: false,
    isExecutable: false,
  }
}

export function createConceptArtifact(
  metadata: Metadata,
  content: ConceptContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & { level: "strategic" },
  relationships?: SOLArtifactRelationships
): ConceptArtifact {
  return {
    type: "Concept",
    metadata,
    content,
    uses,
    organizational,
    ...(relationships && { relationships }),
    isValid: false,
    isExecutable: false,
  }
}

export function createPrincipleArtifact(
  metadata: Metadata,
  content: PrincipleContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & { level: "strategic" },
  relationships?: SOLArtifactRelationships
): PrincipleArtifact {
  return {
    type: "Principle",
    metadata,
    content,
    uses,
    organizational,
    ...(relationships && { relationships }),
    isValid: false,
    isExecutable: false,
  }
}

export function createGuidelineArtifact(
  metadata: Metadata,
  content: GuidelineContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & { level: "strategic" },
  relationships?: SOLArtifactRelationships
): GuidelineArtifact {
  return {
    type: "Guideline",
    metadata,
    content,
    uses,
    organizational,
    ...(relationships && { relationships }),
    isValid: false,
    isExecutable: false,
  }
}

export function createIndicatorArtifact(
  metadata: Metadata,
  content: IndicatorContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational> & { level: "strategic" },
  relationships?: SOLArtifactRelationships
): IndicatorArtifact {
  return {
    type: "Indicator",
    metadata,
    content,
    uses,
    organizational,
    ...(relationships && { relationships }),
    isValid: false,
    isExecutable: false,
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateVisionContent(content: VisionContent): boolean {
  return !!(
    content.statement &&
    content.timeHorizon &&
    Array.isArray(content.stakeholders) &&
    content.stakeholders.length > 0 &&
    Array.isArray(content.objectives) &&
    content.objectives.length > 0 &&
    Array.isArray(content.successIndicators) &&
    content.successIndicators.length > 0
  )
}

export function validatePolicyContent(content: PolicyContent): boolean {
  return !!(
    content.title &&
    content.statement &&
    Array.isArray(content.scope) &&
    content.scope.length > 0 &&
    Array.isArray(content.rules) &&
    content.rules.length > 0 &&
    content.enforcement?.authority &&
    Array.isArray(content.enforcement.penalties) &&
    content.enforcement.appeals
  )
}

export function validateConceptContent(content: ConceptContent): boolean {
  return !!(
    content.name &&
    content.definition &&
    content.description &&
    Array.isArray(content.properties) &&
    content.properties.length > 0
  )
}

export function validatePrincipleContent(content: PrincipleContent): boolean {
  return !!(
    content.name &&
    content.statement &&
    content.rationale &&
    Array.isArray(content.scope) &&
    content.scope.length > 0 &&
    Array.isArray(content.implications) &&
    content.implications.length > 0
  )
}

export function validateGuidelineContent(content: GuidelineContent): boolean {
  return !!(
    content.name &&
    content.description &&
    Array.isArray(content.recommendations) &&
    content.recommendations.length > 0 &&
    Array.isArray(content.bestPractices) &&
    content.bestPractices.length > 0 &&
    Array.isArray(content.applicability) &&
    content.applicability.length > 0
  )
}

export function validateIndicatorContent(content: IndicatorContent): boolean {
  return !!(
    content.name &&
    content.description &&
    content.metric &&
    content.unit &&
    typeof content.target === "number" &&
    content.frequency &&
    ["daily", "weekly", "monthly", "quarterly", "yearly"].includes(
      content.frequency
    ) &&
    content.source
  )
}

// ============================================================================
// CONTENT TYPE MAPPING EXTENSION
// ============================================================================

declare module "./BaseArtifact" {
  interface SOLArtifactContentMap {
    Vision: VisionContent
    Policy: PolicyContent
    Concept: ConceptContent
    Principle: PrincipleContent
    Guideline: GuidelineContent
    Indicator: IndicatorContent
  }
}
