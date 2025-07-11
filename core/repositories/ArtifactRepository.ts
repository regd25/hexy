/**
 * Artifact Repository - Manages SOL artifacts storage and retrieval
 * Provides persistence layer for semantic artifacts
 */

import { SOLArtifact, SOLArtifactType } from '../artifacts/SOLArtifact';
import { ValidationResult } from '../types/ValidationResult';

export interface ArtifactRepository {
  // Basic CRUD operations
  save(artifact: SOLArtifact): Promise<SOLArtifact>;
  findById(id: string): Promise<SOLArtifact | null>;
  findByType(type: SOLArtifactType): Promise<SOLArtifact[]>;
  findAll(): Promise<SOLArtifact[]>;
  update(id: string, artifact: Partial<SOLArtifact>): Promise<SOLArtifact>;
  delete(id: string): Promise<boolean>;
  
  // Semantic operations
  findByReference(reference: string): Promise<SOLArtifact | null>;
  findDependencies(artifactId: string): Promise<SOLArtifact[]>;
  findDependents(artifactId: string): Promise<SOLArtifact[]>;
  findByTag(tag: string): Promise<SOLArtifact[]>;
  findByAuthor(author: string): Promise<SOLArtifact[]>;
  
  // Advanced queries
  findByComposition(uses: Record<string, string>): Promise<SOLArtifact[]>;
  findByOrganizationalLevel(level: 'strategic' | 'tactical' | 'operational'): Promise<SOLArtifact[]>;
  findByArea(area: string): Promise<SOLArtifact[]>;
  findExecutableArtifacts(): Promise<SOLArtifact[]>;
  findInvalidArtifacts(): Promise<SOLArtifact[]>;
  
  // Validation integration
  updateValidationResult(artifactId: string, result: ValidationResult): Promise<void>;
  findByValidationStatus(isValid: boolean): Promise<SOLArtifact[]>;
  
  // Versioning
  getVersionHistory(artifactId: string): Promise<SOLArtifact[]>;
  createVersion(artifactId: string, changes: Partial<SOLArtifact>): Promise<SOLArtifact>;
  
  // Batch operations
  saveBatch(artifacts: SOLArtifact[]): Promise<SOLArtifact[]>;
  validateBatch(artifacts: SOLArtifact[]): Promise<Map<string, ValidationResult>>;
  
  // Search and indexing
  search(query: ArtifactSearchQuery): Promise<ArtifactSearchResult>;
  reindex(): Promise<void>;
  
  // Health and maintenance
  cleanup(): Promise<void>;
  getStatistics(): Promise<RepositoryStatistics>;
  
  /**
   * ✅ Batch method for finding multiple references efficiently
   */
  findByReferences(references: string[]): Promise<Map<string, SOLArtifact>>;
}

export interface ArtifactSearchQuery {
  text?: string;
  type?: SOLArtifactType;
  tags?: string[];
  author?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  validationStatus?: boolean;
  organizationalLevel?: 'strategic' | 'tactical' | 'operational';
  area?: string;
  hasReferences?: boolean;
  executionStrategy?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created' | 'modified' | 'name' | 'type' | 'score';
  sortOrder?: 'asc' | 'desc';
}

export interface ArtifactSearchResult {
  artifacts: SOLArtifact[];
  totalCount: number;
  facets: SearchFacets;
  query: ArtifactSearchQuery;
  executionTime: number;
}

export interface SearchFacets {
  types: Array<{ type: SOLArtifactType; count: number }>;
  tags: Array<{ tag: string; count: number }>;
  authors: Array<{ author: string; count: number }>;
  areas: Array<{ area: string; count: number }>;
  validationStatus: Array<{ status: boolean; count: number }>;
}

export interface RepositoryStatistics {
  totalArtifacts: number;
  artifactsByType: Map<SOLArtifactType, number>;
  validArtifacts: number;
  invalidArtifacts: number;
  recentlyModified: number;
  averageValidationScore: number;
  orphanedArtifacts: number;
  circularDependencies: number;
  storageSize: number;
  indexSize: number;
  lastCleanup: Date;
}

export class InMemoryArtifactRepository implements ArtifactRepository {
  private artifacts: Map<string, SOLArtifact>;
  private index: ArtifactIndex;
  private validationResults: Map<string, ValidationResult>;
  private versionHistory: Map<string, SOLArtifact[]>;

  constructor() {
    this.artifacts = new Map();
    this.index = new ArtifactIndex();
    this.validationResults = new Map();
    this.versionHistory = new Map();
  }

  async save(artifact: SOLArtifact): Promise<SOLArtifact> {
    // Validate artifact structure
    this.validateArtifactStructure(artifact);
    
    // Set metadata
    const now = new Date();
    if (!artifact.metadata.created) {
      artifact.metadata.created = now;
    }
    artifact.metadata.lastModified = now;
    
    // Store artifact
    this.artifacts.set(artifact.metadata.id, artifact);
    
    // Update index
    await this.index.add(artifact);
    
    // Create version entry
    await this.createVersionEntry(artifact);
    
    return artifact;
  }

  async findById(id: string): Promise<SOLArtifact | null> {
    return this.artifacts.get(id) || null;
  }

  async findByType(type: SOLArtifactType): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => artifact.type === type);
  }

  async findAll(): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values());
  }

  async update(id: string, changes: Partial<SOLArtifact>): Promise<SOLArtifact> {
    const existing = this.artifacts.get(id);
    if (!existing) {
      throw new Error(`Artifact not found: ${id}`);
    }

    const updated = {
      ...existing,
      ...changes,
      metadata: {
        ...existing.metadata,
        ...changes.metadata,
        lastModified: new Date()
      }
    };

    return this.save(updated);
  }

  async delete(id: string): Promise<boolean> {
    const artifact = this.artifacts.get(id);
    if (!artifact) {
      return false;
    }

    // Check for dependents
    const dependents = await this.findDependents(id);
    if (dependents.length > 0) {
      throw new Error(`Cannot delete artifact ${id}: has dependents ${dependents.map(d => d.metadata.id).join(', ')}`);
    }

    // Remove from storage
    this.artifacts.delete(id);
    
    // Remove from index
    await this.index.remove(artifact);
    
    // Clean up validation results
    this.validationResults.delete(id);
    
    // Clean up version history
    this.versionHistory.delete(id);

    return true;
  }

  async findByReference(reference: string): Promise<SOLArtifact | null> {
    // Parse reference format: Type:Id
    const [type, id] = reference.split(':');
    if (!type || !id) {
      return null;
    }
    
    const artifact = this.artifacts.get(id);
    if (!artifact || artifact.type !== type) {
      return null;
    }
    
    return artifact;
  }

  async findDependencies(artifactId: string): Promise<SOLArtifact[]> {
    const artifact = this.artifacts.get(artifactId);
    if (!artifact) {
      return [];
    }

    const dependencies: SOLArtifact[] = [];
    
    // Find foundational dependencies
    if (artifact.uses) {
      for (const reference of Object.values(artifact.uses)) {
        if (reference) {
          const dep = await this.findByReference(reference);
          if (dep) {
            dependencies.push(dep);
          }
        }
      }
    }
    
    // Find relationship dependencies
    if (artifact.relationships?.dependsOn) {
      for (const reference of artifact.relationships.dependsOn) {
        const dep = await this.findByReference(reference);
        if (dep) {
          dependencies.push(dep);
        }
      }
    }
    
    return dependencies;
  }

  async findDependents(artifactId: string): Promise<SOLArtifact[]> {
    const targetRef = `${this.artifacts.get(artifactId)?.type}:${artifactId}`;
    const dependents: SOLArtifact[] = [];
    
    for (const artifact of this.artifacts.values()) {
      // Check foundational references
      if (artifact.uses && Object.values(artifact.uses).includes(targetRef)) {
        dependents.push(artifact);
        continue;
      }
      
      // Check relationship references
      if (artifact.relationships?.dependsOn?.includes(targetRef)) {
        dependents.push(artifact);
        continue;
      }
      
      // Check other relationships
      if (artifact.relationships?.supports?.includes(targetRef) ||
          artifact.relationships?.implements?.includes(targetRef) ||
          artifact.relationships?.measuredBy?.includes(targetRef)) {
        dependents.push(artifact);
      }
    }
    
    return dependents;
  }

  async findByTag(tag: string): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => 
      artifact.metadata.tags?.includes(tag)
    );
  }

  async findByAuthor(author: string): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => 
      artifact.metadata.author === author
    );
  }

  async findByComposition(uses: Record<string, string>): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => {
      if (!artifact.uses) return false;
      
      return Object.entries(uses).every(([key, value]) => 
        artifact.uses![key as keyof typeof artifact.uses] === value
      );
    });
  }

  async findByOrganizationalLevel(level: 'strategic' | 'tactical' | 'operational'): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => 
      artifact.organizational?.level === level
    );
  }

  async findByArea(area: string): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => 
      artifact.organizational?.area === area
    );
  }

  async findExecutableArtifacts(): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => 
      artifact.isExecutable === true
    );
  }

  async findInvalidArtifacts(): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => 
      artifact.isValid === false
    );
  }

  async updateValidationResult(artifactId: string, result: ValidationResult): Promise<void> {
    this.validationResults.set(artifactId, result);
    
    // Update artifact validation status
    const artifact = this.artifacts.get(artifactId);
    if (artifact) {
      artifact.isValid = result.isValid;
      artifact.validationErrors = result.errors.map(e => e.message);
      artifact.lastValidated = result.timestamp;
    }
  }

  async findByValidationStatus(isValid: boolean): Promise<SOLArtifact[]> {
    return Array.from(this.artifacts.values()).filter(artifact => 
      artifact.isValid === isValid
    );
  }

  async getVersionHistory(artifactId: string): Promise<SOLArtifact[]> {
    return this.versionHistory.get(artifactId) || [];
  }

  async createVersion(artifactId: string, changes: Partial<SOLArtifact>): Promise<SOLArtifact> {
    const current = this.artifacts.get(artifactId);
    if (!current) {
      throw new Error(`Artifact not found: ${artifactId}`);
    }

    const newVersion = {
      ...current,
      ...changes,
      metadata: {
        ...current.metadata,
        ...changes.metadata,
        version: this.incrementVersion(current.metadata.version),
        lastModified: new Date()
      }
    };

    return this.save(newVersion);
  }

  async saveBatch(artifacts: SOLArtifact[]): Promise<SOLArtifact[]> {
    const results: SOLArtifact[] = [];
    
    for (const artifact of artifacts) {
      try {
        const saved = await this.save(artifact);
        results.push(saved);
      } catch (error) {
        // Log error but continue with other artifacts
        console.error(`Failed to save artifact ${artifact.metadata.id}:`, error);
      }
    }
    
    return results;
  }

  async validateBatch(artifacts: SOLArtifact[]): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();
    
    for (const artifact of artifacts) {
      // Basic validation - this would integrate with ValidationSystem
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        score: 100,
        timestamp: new Date(),
        validator: 'repository'
      };
      
      results.set(artifact.metadata.id, result);
    }
    
    return results;
  }

  async search(query: ArtifactSearchQuery): Promise<ArtifactSearchResult> {
    const startTime = Date.now();
    let results = Array.from(this.artifacts.values());
    
    // Apply filters
    if (query.type) {
      results = results.filter(a => a.type === query.type);
    }
    
    if (query.tags) {
      results = results.filter(a => 
        query.tags!.some(tag => a.metadata.tags?.includes(tag))
      );
    }
    
    if (query.author) {
      results = results.filter(a => a.metadata.author === query.author);
    }
    
    if (query.validationStatus !== undefined) {
      results = results.filter(a => a.isValid === query.validationStatus);
    }
    
    if (query.organizationalLevel) {
      results = results.filter(a => a.organizational?.level === query.organizationalLevel);
    }
    
    if (query.area) {
      results = results.filter(a => a.organizational?.area === query.area);
    }
    
    if (query.text) {
      const searchText = query.text.toLowerCase();
      results = results.filter(a => 
        a.metadata.id.toLowerCase().includes(searchText) ||
        JSON.stringify(a.content).toLowerCase().includes(searchText)
      );
    }
    
    // Apply sorting
    if (query.sortBy) {
      results.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (query.sortBy) {
          case 'created':
            aVal = a.metadata.created;
            bVal = b.metadata.created;
            break;
          case 'modified':
            aVal = a.metadata.lastModified;
            bVal = b.metadata.lastModified;
            break;
          case 'name':
            aVal = a.metadata.id;
            bVal = b.metadata.id;
            break;
          case 'type':
            aVal = a.type;
            bVal = b.type;
            break;
          default:
            return 0;
        }
        
        if (query.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }
    
    const totalCount = results.length;
    
    // Apply pagination
    if (query.offset) {
      results = results.slice(query.offset);
    }
    
    if (query.limit) {
      results = results.slice(0, query.limit);
    }
    
    // Generate facets
    const facets = this.generateFacets(Array.from(this.artifacts.values()));
    
    return {
      artifacts: results,
      totalCount,
      facets,
      query,
      executionTime: Date.now() - startTime
    };
  }

  async reindex(): Promise<void> {
    this.index = new ArtifactIndex();
    
    for (const artifact of this.artifacts.values()) {
      await this.index.add(artifact);
    }
  }

  async cleanup(): Promise<void> {
    // Remove orphaned validation results
    for (const id of this.validationResults.keys()) {
      if (!this.artifacts.has(id)) {
        this.validationResults.delete(id);
      }
    }
    
    // Remove orphaned version history
    for (const id of this.versionHistory.keys()) {
      if (!this.artifacts.has(id)) {
        this.versionHistory.delete(id);
      }
    }
  }

  async getStatistics(): Promise<RepositoryStatistics> {
    const artifacts = Array.from(this.artifacts.values());
    const artifactsByType = new Map<SOLArtifactType, number>();
    
    for (const artifact of artifacts) {
      const current = artifactsByType.get(artifact.type) || 0;
      artifactsByType.set(artifact.type, current + 1);
    }
    
    const validArtifacts = artifacts.filter(a => a.isValid).length;
    const invalidArtifacts = artifacts.filter(a => a.isValid === false).length;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentlyModified = artifacts.filter(a => a.metadata.lastModified > weekAgo).length;
    
    const validationScores = Array.from(this.validationResults.values()).map(r => r.score);
    const averageValidationScore = validationScores.length > 0 
      ? validationScores.reduce((a, b) => a + b, 0) / validationScores.length 
      : 0;
    
    return {
      totalArtifacts: artifacts.length,
      artifactsByType,
      validArtifacts,
      invalidArtifacts,
      recentlyModified,
      averageValidationScore,
      orphanedArtifacts: 0, // TODO: implement orphan detection
      circularDependencies: 0, // TODO: implement circular dependency detection
      storageSize: JSON.stringify(Array.from(this.artifacts.values())).length,
      indexSize: this.index.size(),
      lastCleanup: new Date()
    };
  }

  // Private methods
  private validateArtifactStructure(artifact: SOLArtifact): void {
    if (!artifact.metadata || !artifact.metadata.id) {
      throw new Error('Artifact must have metadata with id');
    }
    
    if (!artifact.type) {
      throw new Error('Artifact must have type');
    }
    
    if (!artifact.content) {
      throw new Error('Artifact must have content');
    }
  }

  private async createVersionEntry(artifact: SOLArtifact): Promise<void> {
    const history = this.versionHistory.get(artifact.metadata.id) || [];
    history.push({ ...artifact });
    
    // Keep only last 10 versions
    if (history.length > 10) {
      history.shift();
    }
    
    this.versionHistory.set(artifact.metadata.id, history);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private generateFacets(artifacts: SOLArtifact[]): SearchFacets {
    const typeCounts = new Map<SOLArtifactType, number>();
    const tagCounts = new Map<string, number>();
    const authorCounts = new Map<string, number>();
    const areaCounts = new Map<string, number>();
    const validationCounts = new Map<boolean, number>();
    
    for (const artifact of artifacts) {
      // Type counts
      const typeCount = typeCounts.get(artifact.type) || 0;
      typeCounts.set(artifact.type, typeCount + 1);
      
      // Tag counts
      if (artifact.metadata.tags) {
        for (const tag of artifact.metadata.tags) {
          const tagCount = tagCounts.get(tag) || 0;
          tagCounts.set(tag, tagCount + 1);
        }
      }
      
      // Author counts
      const authorCount = authorCounts.get(artifact.metadata.author) || 0;
      authorCounts.set(artifact.metadata.author, authorCount + 1);
      
      // Area counts
      if (artifact.organizational?.area) {
        const areaCount = areaCounts.get(artifact.organizational.area) || 0;
        areaCounts.set(artifact.organizational.area, areaCount + 1);
      }
      
      // Validation status counts
      const validationCount = validationCounts.get(artifact.isValid || false) || 0;
      validationCounts.set(artifact.isValid || false, validationCount + 1);
    }
    
    return {
      types: Array.from(typeCounts.entries()).map(([type, count]) => ({ type, count })),
      tags: Array.from(tagCounts.entries()).map(([tag, count]) => ({ tag, count })),
      authors: Array.from(authorCounts.entries()).map(([author, count]) => ({ author, count })),
      areas: Array.from(areaCounts.entries()).map(([area, count]) => ({ area, count })),
      validationStatus: Array.from(validationCounts.entries()).map(([status, count]) => ({ status, count }))
    };
  }

  /**
   * ✅ Batch method for finding multiple references efficiently
   */
  async findByReferences(references: string[]): Promise<Map<string, SOLArtifact>> {
    const results = new Map<string, SOLArtifact>()
    
    // This would be optimized based on the storage backend
    // For database: single query with IN clause
    // For file system: parallel file reads
    // For memory: direct lookup
    
    for (const reference of references) {
      const artifact = await this.findByReference(reference)
      if (artifact) {
        results.set(reference, artifact)
      }
    }
    
    return results
  }
}

// Supporting classes
class ArtifactIndex {
  private index: Map<string, Set<string>>;
  
  constructor() {
    this.index = new Map();
  }
  
  async add(artifact: SOLArtifact): Promise<void> {
    const id = artifact.metadata.id;
    
    // Index by type
    this.addToIndex(`type:${artifact.type}`, id);
    
    // Index by tags
    if (artifact.metadata.tags) {
      for (const tag of artifact.metadata.tags) {
        this.addToIndex(`tag:${tag}`, id);
      }
    }
    
    // Index by author
    this.addToIndex(`author:${artifact.metadata.author}`, id);
    
    // Index by area
    if (artifact.organizational?.area) {
      this.addToIndex(`area:${artifact.organizational.area}`, id);
    }
  }
  
  async remove(artifact: SOLArtifact): Promise<void> {
    const id = artifact.metadata.id;
    
    for (const ids of this.index.values()) {
      ids.delete(id);
    }
  }
  
  size(): number {
    return this.index.size;
  }
  
  private addToIndex(key: string, id: string): void {
    if (!this.index.has(key)) {
      this.index.set(key, new Set());
    }
    this.index.get(key)!.add(id);
  }
} 