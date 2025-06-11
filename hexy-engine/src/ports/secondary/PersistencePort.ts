import { SOLArtifact } from '../../domain/entities/SOLArtifact';

/**
 * Secondary port for persistence operations
 * Defines the contract for data storage and retrieval
 */
export interface PersistencePort {
  /**
   * Save a SOL artifact to persistent storage
   */
  saveArtifact(artifact: SOLArtifact): Promise<void>;

  /**
   * Retrieve a SOL artifact by its ID and type
   */
  getArtifact<T extends SOLArtifact>(id: string, type: new (...args: unknown[]) => T): Promise<T | null>;

  /**
   * Update an existing SOL artifact
   */
  updateArtifact(artifact: SOLArtifact): Promise<void>;

  /**
   * Delete a SOL artifact by ID
   */
  deleteArtifact(id: string): Promise<void>;

  /**
   * Find artifacts by criteria
   */
  findArtifacts(criteria: SearchCriteria): Promise<SOLArtifact[]>;

  /**
   * Get all artifacts of a specific type
   */
  getArtifactsByType<T extends SOLArtifact>(type: new (...args: unknown[]) => T): Promise<T[]>;

  /**
   * Get artifacts related to a specific vision
   */
  getArtifactsByVision(visionId: string): Promise<SOLArtifact[]>;

  /**
   * Save execution state for a process
   */
  saveExecutionState(processId: string, state: ProcessExecutionState): Promise<void>;

  /**
   * Get execution state for a process
   */
  getExecutionState(processId: string): Promise<ProcessExecutionState | null>;

  /**
   * Save execution history entry
   */
  saveExecutionHistory(entry: ExecutionHistoryEntry): Promise<void>;

  /**
   * Get execution history for a process
   */
  getExecutionHistory(processId: string, limit?: number): Promise<ExecutionHistoryEntry[]>;

  /**
   * Transaction support for atomic operations
   */
  transaction<T>(operation: (tx: TransactionContext) => Promise<T>): Promise<T>;

  /**
   * Check if an artifact exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Get artifact relationships
   */
  getRelationships(artifactId: string): Promise<ArtifactRelationship[]>;

  /**
   * Save artifact relationship
   */
  saveRelationship(relationship: ArtifactRelationship): Promise<void>;
}

export interface SearchCriteria {
  type?: string;
  vision?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  text?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ProcessExecutionState {
  processId: string;
  status: ExecutionStatus;
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  pausedAt?: Date;
  completedAt?: Date;
  context: Record<string, unknown>;
  stepResults: StepExecutionResult[];
}

export interface ExecutionHistoryEntry {
  id: string;
  processId: string;
  timestamp: Date;
  event: string;
  details: string;
  stepIndex?: number;
  actor?: string;
  data?: Record<string, unknown>;
}

export interface StepExecutionResult {
  stepIndex: number;
  status: ExecutionStatus;
  output?: unknown;
  error?: string;
  executedAt: Date;
  duration: number;
  actor: string;
}

export interface ArtifactRelationship {
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface TransactionContext {
  saveArtifact(artifact: SOLArtifact): Promise<void>;
  updateArtifact(artifact: SOLArtifact): Promise<void>;
  deleteArtifact(id: string): Promise<void>;
  saveExecutionState(processId: string, state: ProcessExecutionState): Promise<void>;
}

export enum ExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum RelationshipType {
  DEPENDS_ON = 'DEPENDS_ON',
  IMPLEMENTS = 'IMPLEMENTS',
  VALIDATES = 'VALIDATES',
  EXECUTES = 'EXECUTES',
  PRODUCES = 'PRODUCES',
  CONFLICTS_WITH = 'CONFLICTS_WITH'
} 