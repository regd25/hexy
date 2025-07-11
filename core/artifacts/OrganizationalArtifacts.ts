/**
 * Organizational Artifacts - SOL artifacts that define organizational structure
 * Contains Actor and Area artifacts
 */

import {
  SOLArtifact,
  SOLArtifactUses,
  SOLArtifactOrganizational,
  SOLArtifactRelationships,
  Metadata,
} from "./BaseArtifact"

// ============================================================================
// ORGANIZATIONAL ARTIFACT CONTENT SCHEMAS
// ============================================================================

export interface ActorContent {
  name: string
  description: string
  area: string // Area:Id reference
  level: "strategic" | "tactical" | "operational"
  type: "internal" | "external" | "system"
  responsibilities: string[]
  capabilities: string[]
  contacts?: Record<string, string>
  availability?: {
    schedule: string
    timezone: string
  }
}

export interface AreaContent {
  name: string
  description: string
  parentArea?: string // Area:Id reference
  subAreas?: string[] // Area:Id references
  boundaries: string[]
  stakeholders: string[] // Actor:Id references
  governance: {
    authority: string // Authority:Id reference
    policies: string[] // Policy:Id references
  }
}

// ============================================================================
// ORGANIZATIONAL ARTIFACT INTERFACES
// ============================================================================

export interface ActorArtifact extends SOLArtifact<"Actor"> {
  type: "Actor"
  content: ActorContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational>
}

export interface AreaArtifact extends SOLArtifact<"Area"> {
  type: "Area"
  content: AreaContent
  // Composite artifacts must use foundational artifacts
  uses: Required<SOLArtifactUses>
  organizational: Required<SOLArtifactOrganizational>
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isActorArtifact(
  artifact: SOLArtifact
): artifact is ActorArtifact {
  return artifact.type === "Actor"
}

export function isAreaArtifact(
  artifact: SOLArtifact
): artifact is AreaArtifact {
  return artifact.type === "Area"
}

export function isOrganizationalArtifact(
  artifact: SOLArtifact
): artifact is ActorArtifact | AreaArtifact {
  return ["Actor", "Area"].includes(artifact.type)
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createActorArtifact(
  metadata: Metadata,
  content: ActorContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational>,
  relationships?: SOLArtifactRelationships
): ActorArtifact {
  return {
    type: "Actor",
    metadata,
    content,
    uses,
    organizational,
    ...(relationships && { relationships }),
    isValid: false,
    isExecutable: false,
  }
}

export function createAreaArtifact(
  metadata: Metadata,
  content: AreaContent,
  uses: Required<SOLArtifactUses>,
  organizational: Required<SOLArtifactOrganizational>,
  relationships?: SOLArtifactRelationships
): AreaArtifact {
  return {
    type: "Area",
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

export function validateActorContent(content: ActorContent): boolean {
  return !!(
    content.name &&
    content.description &&
    content.area &&
    content.level &&
    content.type &&
    Array.isArray(content.responsibilities) &&
    Array.isArray(content.capabilities)
  )
}

export function validateAreaContent(content: AreaContent): boolean {
  return !!(
    content.name &&
    content.description &&
    Array.isArray(content.boundaries) &&
    Array.isArray(content.stakeholders) &&
    content.governance?.authority &&
    Array.isArray(content.governance.policies)
  )
}

// ============================================================================
// CONTENT TYPE MAPPING EXTENSION
// ============================================================================

declare module "./BaseArtifact" {
  interface SOLArtifactContentMap {
    Actor: ActorContent
    Area: AreaContent
  }
}
