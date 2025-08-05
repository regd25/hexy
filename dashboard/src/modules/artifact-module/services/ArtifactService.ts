/**
 * Artifact Service - Business logic layer for artifact management
 * Implements hexagonal architecture with clean domain boundaries
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  Artifact, 
  TemporalArtifact, 
  CreateArtifactPayload, 
  UpdateArtifactPayload, 
  ArtifactSearchQuery,
  ArtifactFilter,
  ArtifactExport,
  artifactSchema,
  temporalArtifactSchema,
  ARTIFACT_TYPE_CONFIGS
} from '../types/artifact.types';
import { ValidationService } from './ValidationService';
import { EventBus } from '@/contexts/EventBusContext';

/**
 * Repository interface for artifact persistence
 * Follows repository pattern for data access
 */
export interface ArtifactRepository {
  save(artifact: Artifact): Promise<Artifact>;
  findById(id: string): Promise<Artifact | null>;
  findAll(filter?: ArtifactFilter): Promise<Artifact[]>;
  findByQuery(query: ArtifactSearchQuery): Promise<Artifact[]>;
  update(id: string, updates: Partial<Artifact>): Promise<Artifact>;
  delete(id: string): Promise<boolean>;
  export(): Promise<ArtifactExport>;
  import(data: ArtifactExport): Promise<void>;
}

/**
 * Event types for artifact lifecycle
 */
export const ARTIFACT_EVENTS = {
  CREATED: 'artifact:created',
  UPDATED: 'artifact:updated',
  DELETED: 'artifact:deleted',
  VALIDATED: 'artifact:validated',
  RELATIONSHIP_CREATED: 'artifact:relationship_created',
  RELATIONSHIP_DELETED: 'artifact:relationship_deleted',
  EXPORTED: 'artifact:exported',
  IMPORTED: 'artifact:imported'
} as const;

/**
 * Main artifact service implementing business logic
 */
export class ArtifactService {
  private repository: ArtifactRepository;
  private validationService: ValidationService;
  private eventBus: EventBus;

  constructor(
    repository: ArtifactRepository,
    validationService: ValidationService,
    eventBus: EventBus
  ) {
    this.repository = repository;
    this.validationService = validationService;
    this.eventBus = eventBus;
  }

  /**
   * Create a new artifact with validation
   */
  async createArtifact(payload: CreateArtifactPayload): Promise<Artifact> {
    const id = uuidv4();
    const now = new Date();
    
    const artifact: Artifact = {
      id,
      ...payload,
      purpose: payload.purpose || ARTIFACT_TYPE_CONFIGS[payload.type].defaultPurpose || '',
      context: payload.context || {},
      authority: payload.authority || ARTIFACT_TYPE_CONFIGS[payload.type].defaultAuthority || '',
      evaluationCriteria: payload.evaluationCriteria || ARTIFACT_TYPE_CONFIGS[payload.type].defaultEvaluationCriteria || [],
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      relationships: [],
      isValid: false,
      validationErrors: []
    };

    // Validate artifact
    const validationResult = await this.validationService.validateArtifact(artifact);
    artifact.isValid = validationResult.isValid;
    artifact.validationErrors = validationResult.errors;

    // Save to repository
    const savedArtifact = await this.repository.save(artifact);

    // Emit event
    this.eventBus.emit(ARTIFACT_EVENTS.CREATED, { artifact: savedArtifact });

    return savedArtifact;
  }

  /**
   * Update an existing artifact
   */
  async updateArtifact(id: string, payload: UpdateArtifactPayload): Promise<Artifact> {
    const existingArtifact = await this.repository.findById(id);
    if (!existingArtifact) {
      throw new Error(`Artifact with id ${id} not found`);
    }

    const updatedArtifact: Artifact = {
      ...existingArtifact,
      ...payload,
      updatedAt: new Date(),
      version: this.incrementVersion(existingArtifact.version)
    };

    // Re-validate artifact
    const validationResult = await this.validationService.validateArtifact(updatedArtifact);
    updatedArtifact.isValid = validationResult.isValid;
    updatedArtifact.validationErrors = validationResult.errors;

    // Save to repository
    const savedArtifact = await this.repository.update(id, updatedArtifact);

    // Emit event
    this.eventBus.emit(ARTIFACT_EVENTS.UPDATED, { artifact: savedArtifact });

    return savedArtifact;
  }

  /**
   * Get artifact by ID
   */
  async getArtifact(id: string): Promise<Artifact | null> {
    return await this.repository.findById(id);
  }

  /**
   * Get all artifacts with optional filtering
   */
  async getArtifacts(filter?: ArtifactFilter): Promise<Artifact[]> {
    return await this.repository.findAll(filter);
  }

  /**
   * Search artifacts using semantic query
   */
  async searchArtifacts(query: ArtifactSearchQuery): Promise<Artifact[]> {
    return await this.repository.findByQuery(query);
  }

  /**
   * Delete an artifact and its relationships
   */
  async deleteArtifact(id: string): Promise<boolean> {
    const artifact = await this.repository.findById(id);
    if (!artifact) {
      return false;
    }

    // Delete from repository
    const deleted = await this.repository.delete(id);

    if (deleted) {
      // Emit event
      this.eventBus.emit(ARTIFACT_EVENTS.DELETED, { artifactId: id });
    }

    return deleted;
  }

  /**
   * Validate an artifact
   */
  async validateArtifact(artifact: Artifact): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const result = await this.validationService.validateArtifact(artifact);
    
    this.eventBus.emit(ARTIFACT_EVENTS.VALIDATED, { 
      artifactId: artifact.id, 
      isValid: result.isValid, 
      errors: result.errors 
    });

    return result;
  }

  /**
   * Export all artifacts and relationships
   */
  async exportArtifacts(): Promise<ArtifactExport> {
    const exportData = await this.repository.export();
    
    this.eventBus.emit(ARTIFACT_EVENTS.EXPORTED, { exportData });
    
    return exportData;
  }

  /**
   * Import artifacts and relationships
   */
  async importArtifacts(data: ArtifactExport): Promise<void> {
    await this.repository.import(data);
    
    this.eventBus.emit(ARTIFACT_EVENTS.IMPORTED, { data });
  }

  /**
   * Get artifact statistics
   */
  async getStatistics(): Promise<{
    totalArtifacts: number;
    validArtifacts: number;
    invalidArtifacts: number;
    artifactsByType: Record<string, number>;
    totalRelationships: number;
  }> {
    const artifacts = await this.repository.findAll();
    
    const validArtifacts = artifacts.filter(a => a.isValid);
    const invalidArtifacts = artifacts.filter(a => !a.isValid);
    
    const artifactsByType = artifacts.reduce((acc, artifact) => {
      acc[artifact.type] = (acc[artifact.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRelationships = artifacts.reduce(
      (sum, artifact) => sum + artifact.relationships.length, 
      0
    );

    return {
      totalArtifacts: artifacts.length,
      validArtifacts: validArtifacts.length,
      invalidArtifacts: invalidArtifacts.length,
      artifactsByType,
      totalRelationships
    };
  }

  /**
   * Helper method to increment version
   */
  private incrementVersion(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Factory for creating artifact service instances
 */
export class ArtifactServiceFactory {
  static create(
    repository: ArtifactRepository,
    validationService: ValidationService,
    eventBus: EventBus
  ): ArtifactService {
    return new ArtifactService(repository, validationService, eventBus);
  }
}

/**
 * Local storage implementation of artifact repository
 */
export class LocalStorageArtifactRepository implements ArtifactRepository {
  private readonly STORAGE_KEY = 'hexy-artifacts';

  async save(artifact: Artifact): Promise<Artifact> {
    const artifacts = await this.getAllArtifacts();
    artifacts.push(artifact);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(artifacts));
    return artifact;
  }

  async findById(id: string): Promise<Artifact | null> {
    const artifacts = await this.getAllArtifacts();
    return artifacts.find(a => a.id === id) || null;
  }

  async findAll(filter?: ArtifactFilter): Promise<Artifact[]> {
    let artifacts = await this.getAllArtifacts();

    if (filter) {
      if (filter.type) {
        artifacts = artifacts.filter(a => a.type === filter.type);
      }
      if (filter.validity) {
        artifacts = artifacts.filter(a => 
          filter.validity === 'valid' ? a.isValid : !a.isValid
        );
      }
      if (filter.createdAfter) {
        artifacts = artifacts.filter(a => a.createdAt >= filter.createdAfter!);
      }
      if (filter.createdBefore) {
        artifacts = artifacts.filter(a => a.createdAt <= filter.createdBefore!);
      }
    }

    return artifacts;
  }

  async findByQuery(query: ArtifactSearchQuery): Promise<Artifact[]> {
    const artifacts = await this.getAllArtifacts();
    
    return artifacts.filter(artifact => {
      if (query.text && !artifact.name.toLowerCase().includes(query.text.toLowerCase()) &&
          !artifact.description.toLowerCase().includes(query.text.toLowerCase())) {
        return false;
      }
      if (query.type && artifact.type !== query.type) {
        return false;
      }
      return true;
    });
  }

  async update(id: string, updates: Partial<Artifact>): Promise<Artifact> {
    const artifacts = await this.getAllArtifacts();
    const index = artifacts.findIndex(a => a.id === id);
    
    if (index === -1) {
      throw new Error(`Artifact with id ${id} not found`);
    }

    artifacts[index] = { ...artifacts[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(artifacts));
    
    return artifacts[index];
  }

  async delete(id: string): Promise<boolean> {
    const artifacts = await this.getAllArtifacts();
    const filteredArtifacts = artifacts.filter(a => a.id !== id);
    
    if (filteredArtifacts.length === artifacts.length) {
      return false;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredArtifacts));
    return true;
  }

  async export(): Promise<ArtifactExport> {
    const artifacts = await this.getAllArtifacts();
    const relationships = artifacts.flatMap(a => a.relationships);

    return {
      artifacts,
      relationships,
      metadata: {
        version: '1.0.0',
        exportedAt: new Date(),
        totalArtifacts: artifacts.length,
        totalRelationships: relationships.length
      }
    };
  }

  async import(data: ArtifactExport): Promise<void> {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.artifacts));
  }

  private async getAllArtifacts(): Promise<Artifact[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}