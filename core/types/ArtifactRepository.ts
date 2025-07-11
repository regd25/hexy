/**
 * Core Abstraction: ArtifactRepository<T>
 * Generic interface for artifact storage and retrieval
 * This interface remains stable regardless of storage implementation
 */

import { SOLArtifact } from "../artifacts"

/**
 * Query criteria for artifact searches
 */
export interface QueryCriteria {
  /**
   * Artifact type filter
   */
  type?: string

  /**
   * Artifact status filter
   */
  status?: string

  /**
   * Author filter
   */
  author?: string

  /**
   * Tags filter
   */
  tags?: string[]

  /**
   * Date range filter
   */
  dateRange?: {
    from?: Date
    to?: Date
  }

  /**
   * Text search query
   */
  searchQuery?: string

  /**
   * Pagination options
   */
  pagination?: {
    page: number
    limit: number
  }

  /**
   * Sorting options
   */
  sorting?: {
    field: string
    direction: "asc" | "desc"
  }

  /**
   * Additional custom filters
   */
  customFilters?: Record<string, any>
}

/**
 * Query result with pagination information
 */
export interface QueryResult<T> {
  /**
   * Found artifacts
   */
  items: T[]

  /**
   * Total count of matching artifacts
   */
  totalCount: number

  /**
   * Current page number
   */
  page: number

  /**
   * Number of items per page
   */
  limit: number

  /**
   * Total number of pages
   */
  totalPages: number

  /**
   * Whether there are more pages
   */
  hasMore: boolean
}

/**
 * Artifact repository interface
 * @template T - The artifact type this repository handles
 */
export interface ArtifactRepository<T extends SOLArtifact> {
  /**
   * Save an artifact
   * @param artifact - The artifact to save
   * @returns The saved artifact ID
   */
  save(artifact: T): Promise<string>

  /**
   * Find an artifact by ID
   * @param id - The artifact ID
   * @returns The artifact or undefined if not found
   */
  findById(id: string): Promise<T | undefined>

  /**
   * Find artifacts by type
   * @param type - The artifact type
   * @returns Array of artifacts of the specified type
   */
  findByType(type: string): Promise<T[]>

  /**
   * Find artifacts by author
   * @param author - The author name
   * @returns Array of artifacts by the specified author
   */
  findByAuthor(author: string): Promise<T[]>

  /**
   * Find artifacts by tags
   * @param tags - Array of tags to search for
   * @returns Array of artifacts with matching tags
   */
  findByTags(tags: string[]): Promise<T[]>

  /**
   * Query artifacts with complex criteria
   * @param criteria - The query criteria
   * @returns Query result with pagination
   */
  query(criteria: QueryCriteria): Promise<QueryResult<T>>

  /**
   * Update an existing artifact
   * @param id - The artifact ID
   * @param updates - Partial artifact updates
   * @returns The updated artifact
   */
  update(id: string, updates: Partial<T>): Promise<T>

  /**
   * Delete an artifact
   * @param id - The artifact ID
   * @returns True if the artifact was deleted
   */
  delete(id: string): Promise<boolean>

  /**
   * Check if an artifact exists
   * @param id - The artifact ID
   * @returns True if the artifact exists
   */
  exists(id: string): Promise<boolean>

  /**
   * Get the total count of artifacts
   * @returns Total number of artifacts
   */
  count(): Promise<number>

  /**
   * Get the total count of artifacts by type
   * @param type - The artifact type
   * @returns Total number of artifacts of the specified type
   */
  countByType(type: string): Promise<number>

  /**
   * Get all artifact IDs
   * @returns Array of all artifact IDs
   */
  getAllIds(): Promise<string[]>

  /**
   * Get all artifact types
   * @returns Array of all artifact types
   */
  getAllTypes(): Promise<string[]>

  /**
   * Backup the repository
   * @param backupPath - Path to store the backup
   * @returns True if backup was successful
   */
  backup(backupPath: string): Promise<boolean>

  /**
   * Restore the repository from backup
   * @param backupPath - Path to restore from
   * @returns True if restore was successful
   */
  restore(backupPath: string): Promise<boolean>

  /**
   * Get repository statistics
   * @returns Repository statistics
   */
  getStatistics(): Promise<RepositoryStatistics>

  /**
   * Validate repository integrity
   * @returns Validation result
   */
  validateIntegrity(): Promise<IntegrityValidationResult>
}

/**
 * Repository statistics
 */
export interface RepositoryStatistics {
  /**
   * Total number of artifacts
   */
  totalArtifacts: number

  /**
   * Artifacts by type
   */
  artifactsByType: Record<string, number>

  /**
   * Artifacts by author
   */
  artifactsByAuthor: Record<string, number>

  /**
   * Artifacts by status
   */
  artifactsByStatus: Record<string, number>

  /**
   * Repository size in bytes
   */
  totalSizeBytes: number

  /**
   * Last modification time
   */
  lastModified: Date

  /**
   * Creation time
   */
  createdAt: Date
}

/**
 * Integrity validation result
 */
export interface IntegrityValidationResult {
  /**
   * Whether the repository is valid
   */
  isValid: boolean

  /**
   * Validation errors
   */
  errors: string[]

  /**
   * Validation warnings
   */
  warnings: string[]

  /**
   * Corrupt artifacts
   */
  corruptArtifacts: string[]

  /**
   * Missing references
   */
  missingReferences: string[]

  /**
   * Validation timestamp
   */
  validatedAt: Date
}

/**
 * Repository factory interface
 * Creates repository instances based on configuration
 */
export interface RepositoryFactory {
  /**
   * Create a repository instance
   * @param config - Repository configuration
   * @returns Repository instance
   */
  create<T extends SOLArtifact>(config: RepositoryConfig): ArtifactRepository<T>

  /**
   * Get supported repository types
   * @returns Array of supported repository types
   */
  getSupportedTypes(): string[]

  /**
   * Get configuration schema for a repository type
   * @param type - Repository type
   * @returns Configuration schema
   */
  getConfigurationSchema(type: string): any
}

/**
 * Repository configuration
 */
export interface RepositoryConfig {
  /**
   * Repository type (e.g., 'filesystem', 'database', 'memory')
   */
  type: string

  /**
   * Connection string or path
   */
  connectionString?: string

  /**
   * Repository options
   */
  options?: Record<string, any>

  /**
   * Caching configuration
   */
  caching?: {
    enabled: boolean
    ttl: number
    maxSize: number
  }

  /**
   * Backup configuration
   */
  backup?: {
    enabled: boolean
    interval: number
    retention: number
    path: string
  }
}
