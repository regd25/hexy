/**
 * Core artifact types and interfaces for the Hexy Artifact Module
 * Following Domain-Driven Design principles and semantic architecture
 */

import { z } from 'zod';

/**
 * Semantic artifact types following Hexy framework taxonomy
 */
export const ARTIFACT_TYPES = {
  // Foundational artifacts
  PURPOSE: 'purpose',
  CONTEXT: 'context',
  AUTHORITY: 'authority',
  EVALUATION: 'evaluation',
  
  // Strategic artifacts
  VISION: 'vision',
  POLICY: 'policy',
  PRINCIPLE: 'principle',
  GUIDELINE: 'guideline',
  CONCEPT: 'concept',
  INDICATOR: 'indicator',
  
  // Operational artifacts
  PROCESS: 'process',
  PROCEDURE: 'procedure',
  EVENT: 'event',
  RESULT: 'result',
  OBSERVATION: 'observation',
  
  // Organizational artifacts
  ACTOR: 'actor',
  AREA: 'area',
  
  // System artifacts
  REFERENCE: 'reference'
} as const;

export type ArtifactType = typeof ARTIFACT_TYPES[keyof typeof ARTIFACT_TYPES];

/**
 * Core artifact interface following semantic principles
 */
export interface Artifact {
  readonly id: string;
  name: string;
  type: ArtifactType;
  description: string;
  
  // Semantic metadata
  purpose: string;
  context: Record<string, unknown>;
  authority: string;
  evaluationCriteria: string[];
  
  // Temporal and spatial properties
  coordinates: {
    x: number;
    y: number;
    z?: number;
  };
  
  // Versioning
  version: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  relationships: Relationship[];
  
  // Validation state
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Temporal artifact for draft/in-progress artifacts
 */
export interface TemporalArtifact extends Omit<Artifact, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
  id?: string;
  status: 'creating' | 'editing' | 'validating' | 'error';
  validationErrors?: string[];
  temporaryId: string;
}

/**
 * Semantic relationship between artifacts
 */
export interface Relationship {
  readonly id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  weight: number;
  description?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Relationship types following semantic patterns
 */
export const RELATIONSHIP_TYPES = {
  DEPENDS_ON: 'depends_on',
  IMPLEMENTS: 'implements',
  INFLUENCES: 'influences',
  CONTAINS: 'contains',
  REFERENCES: 'references',
  SUPPORTS: 'supports',
  CONFLICTS_WITH: 'conflicts_with',
  EVOLVES_TO: 'evolves_to'
} as const;

export type RelationshipType = typeof RELATIONSHIP_TYPES[keyof typeof RELATIONSHIP_TYPES];

/**
 * Artifact validation schema using Zod
 */
export const artifactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  type: z.enum(Object.values(ARTIFACT_TYPES) as [ArtifactType, ...ArtifactType[]]),
  description: z.string().min(10).max(2000),
  purpose: z.string().min(10).max(500),
  context: z.record(z.unknown()),
  authority: z.string().min(1).max(100),
  evaluationCriteria: z.array(z.string()).min(1),
  coordinates: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().optional()
  }),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  createdAt: z.date(),
  updatedAt: z.date(),
  relationships: z.array(z.object({
    id: z.string().uuid(),
    sourceId: z.string().uuid(),
    targetId: z.string().uuid(),
    type: z.enum(Object.values(RELATIONSHIP_TYPES) as [RelationshipType, ...RelationshipType[]]),
    weight: z.number().min(0).max(1),
    description: z.string().optional(),
    metadata: z.record(z.unknown()),
    createdAt: z.date()
  })),
  isValid: z.boolean(),
  validationErrors: z.array(z.string())
});

/**
 * Temporal artifact schema
 */
export const temporalArtifactSchema = artifactSchema.partial().extend({
  status: z.enum(['creating', 'editing', 'validating', 'error']),
  temporaryId: z.string().uuid(),
  validationErrors: z.array(z.string()).optional()
});

/**
 * Artifact creation payload
 */
export interface CreateArtifactPayload {
  name: string;
  type: ArtifactType;
  description: string;
  purpose?: string;
  context?: Record<string, unknown>;
  authority?: string;
  evaluationCriteria?: string[];
  coordinates?: { x: number; y: number; z?: number };
}

/**
 * Artifact update payload
 */
export interface UpdateArtifactPayload extends Partial<CreateArtifactPayload> {
  id: string;
}

/**
 * Artifact search query
 */
export interface ArtifactSearchQuery {
  text?: string;
  type?: ArtifactType;
  tags?: string[];
  dateRange?: { start: Date; end: Date };
  relationships?: { type: RelationshipType; targetId?: string }[];
}

/**
 * Artifact filter criteria
 */
export interface ArtifactFilter {
  type?: ArtifactType;
  tags?: string[];
  validity?: 'valid' | 'invalid' | 'all';
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Artifact export format
 */
export interface ArtifactExport {
  artifacts: Artifact[];
  relationships: Relationship[];
  metadata: {
    version: string;
    exportedAt: Date;
    totalArtifacts: number;
    totalRelationships: number;
  };
}

/**
 * Type guards for runtime type checking
 */
export const isArtifact = (value: unknown): value is Artifact => {
  return artifactSchema.safeParse(value).success;
};

export const isTemporalArtifact = (value: unknown): value is TemporalArtifact => {
  return temporalArtifactSchema.safeParse(value).success;
};

export const isValidArtifactType = (type: string): type is ArtifactType => {
  return Object.values(ARTIFACT_TYPES).includes(type as ArtifactType);
};

/**
 * Artifact type configuration
 */
export interface ArtifactTypeConfig {
  color: string;
  icon: string;
  description: string;
  validationRules: z.ZodSchema<unknown>;
  defaultPurpose?: string;
  defaultAuthority?: string;
  defaultEvaluationCriteria?: string[];
}

/**
 * Color palette for artifact types
 */
export const ARTIFACT_COLORS: Record<ArtifactType, string> = {
  [ARTIFACT_TYPES.PURPOSE]: '#3B82F6',
  [ARTIFACT_TYPES.VISION]: '#8B5CF6',
  [ARTIFACT_TYPES.POLICY]: '#EF4444',
  [ARTIFACT_TYPES.PRINCIPLE]: '#F59E0B',
  [ARTIFACT_TYPES.GUIDELINE]: '#10B981',
  [ARTIFACT_TYPES.CONTEXT]: '#6366F1',
  [ARTIFACT_TYPES.ACTOR]: '#EC4899',
  [ARTIFACT_TYPES.CONCEPT]: '#14B8A6',
  [ARTIFACT_TYPES.PROCESS]: '#F97316',
  [ARTIFACT_TYPES.PROCEDURE]: '#84CC16',
  [ARTIFACT_TYPES.EVENT]: '#06B6D4',
  [ARTIFACT_TYPES.RESULT]: '#A855F7',
  [ARTIFACT_TYPES.OBSERVATION]: '#6B7280',
  [ARTIFACT_TYPES.EVALUATION]: '#DC2626',
  [ARTIFACT_TYPES.INDICATOR]: '#059669',
  [ARTIFACT_TYPES.AREA]: '#7C3AED',
  [ARTIFACT_TYPES.AUTHORITY]: '#B91C1C',
  [ARTIFACT_TYPES.REFERENCE]: '#9CA3AF'
};

/**
 * Default configurations for artifact types
 */
export const ARTIFACT_TYPE_CONFIGS: Record<ArtifactType, ArtifactTypeConfig> = {
  [ARTIFACT_TYPES.PURPOSE]: {
    color: ARTIFACT_COLORS[ARTIFACT_TYPES.PURPOSE],
    icon: 'Target',
    description: 'Organizational intention and direction',
    validationRules: z.object({
      description: z.string().min(50).max(1000)
    }),
    defaultPurpose: 'Define organizational direction and intention',
    defaultAuthority: 'Executive Leadership',
    defaultEvaluationCriteria: ['Alignment with mission', 'Measurable impact', 'Stakeholder buy-in']
  },
  [ARTIFACT_TYPES.VISION]: {
    color: ARTIFACT_COLORS[ARTIFACT_TYPES.VISION],
    icon: 'Eye',
    description: 'Desired future state and aspirations',
    validationRules: z.object({
      description: z.string().min(100).max(2000)
    }),
    defaultPurpose: 'Inspire and guide long-term organizational direction',
    defaultAuthority: 'Strategic Planning Committee',
    defaultEvaluationCriteria: ['Inspirational clarity', 'Strategic alignment', 'Time-bound achievability']
  },
  [ARTIFACT_TYPES.POLICY]: {
    color: ARTIFACT_COLORS[ARTIFACT_TYPES.POLICY],
    icon: 'FileText',
    description: 'Organizational rules and commitments',
    validationRules: z.object({
      description: z.string().min(50).max(1500)
    }),
    defaultPurpose: 'Establish clear organizational boundaries and expectations',
    defaultAuthority: 'Policy Committee',
    defaultEvaluationCriteria: ['Legal compliance', 'Enforceability', 'Stakeholder consensus']
  },
  // ... additional configurations for other types
} as const;