/**
 * Base Artifact - Core interfaces and utilities for artifacts
 * Provides the foundation for all artifact types in the system
 */

import { ValidationResult } from '../validation/ValidationSystem'

// ============================================================================
// CORE TYPES
// ============================================================================

export type ArtifactType = 
  | 'Intent' | 'Context' | 'Authority' | 'Evaluation'
  | 'Vision' | 'Policy' | 'Concept' | 'Principle' | 'Guideline' | 'Indicator'
  | 'Process' | 'Procedure' | 'Event' | 'Observation' | 'Result'
  | 'Actor' | 'Area'

export interface Metadata {
  id: string
  version: string
  created: Date
  lastModified: Date
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'deprecated' | 'archived'
  author: string
  reviewedBy?: string
  tags?: string[]
  notes?: string
}

export interface ArtifactUses {
  intent?: string
  context?: string
  authority?: string
  evaluation?: string
}

export interface ArtifactRelationships {
  relates?: string[]
  participatesIn?: string[]
  implementsPolicies?: string[]
  supportsVisions?: string[]
}

export interface ArtifactOrganizational {
  area?: string
  actor?: string
  stakeholders?: string[]
}

export interface ArtifactContentMap {
  [key: string]: any
}

export interface Artifact<T extends ArtifactType = ArtifactType> {
  type: T
  metadata: Metadata
  uses?: ArtifactUses
  relationships?: ArtifactRelationships
  organizational?: ArtifactOrganizational
  content: ArtifactContentMap
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function isFoundationalArtifact(artifact: Artifact): boolean {
  return ['Intent', 'Context', 'Authority', 'Evaluation'].includes(artifact.type)
}

export function isStrategicArtifact(artifact: Artifact): boolean {
  return ['Vision', 'Policy', 'Concept', 'Principle', 'Guideline', 'Indicator'].includes(artifact.type)
}

export function isOperationalArtifact(artifact: Artifact): boolean {
  return ['Process', 'Procedure', 'Event', 'Observation', 'Result'].includes(artifact.type)
}

export function isOrganizationalArtifact(artifact: Artifact): boolean {
  return ['Actor', 'Area'].includes(artifact.type)
}

export function getArtifactType(artifact: Artifact): ArtifactType {
  return artifact.type
}

export function validateArtifactStructure(artifact: Artifact): ValidationResult {
  // Basic structure validation
  if (!artifact.type || !artifact.metadata || !artifact.content) {
    return {
      isValid: false,
      errors: ['Missing required artifact properties: type, metadata, or content']
    }
  }

  // Validate metadata
  if (!artifact.metadata.id || !artifact.metadata.version) {
    return {
      isValid: false,
      errors: ['Missing required metadata: id or version']
    }
  }

  return { isValid: true, errors: [] }
}

export function createArtifactReference(type: ArtifactType, id: string): string {
  return `${type}:${id}`
}

export function parseArtifactReference(reference: string): { type: ArtifactType; id: string } | null {
  const match = reference.match(/^([A-Z][a-zA-Z]+):([A-Z][a-zA-Z0-9]*)$/)
  if (!match) return null
  
  const [, type, id] = match
  return { type: type as ArtifactType, id }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isArtifact(obj: any): obj is Artifact {
  return obj && 
         typeof obj.type === 'string' &&
         obj.metadata &&
         obj.content
}

export function isMetadata(obj: any): obj is Metadata {
  return obj &&
         typeof obj.id === 'string' &&
         typeof obj.version === 'string' &&
         obj.created instanceof Date &&
         obj.lastModified instanceof Date &&
         typeof obj.status === 'string' &&
         typeof obj.author === 'string'
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createArtifact<T extends ArtifactType>(
  type: T,
  id: string,
  content: ArtifactContentMap,
  metadata?: Partial<Metadata>
): Artifact<T> {
  const now = new Date()
  
  const defaultMetadata: Metadata = {
    id,
    version: '1.0.0',
    created: now,
    lastModified: now,
    status: 'draft',
    author: 'system',
    ...metadata
  }

  return {
    type,
    metadata: defaultMetadata,
    content
  }
}

export function getTypedContent<T>(artifact: Artifact): T {
  return artifact.content as T
}
