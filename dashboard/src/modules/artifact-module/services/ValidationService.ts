/**
 * Validation Service - Semantic validation for Hexy artifacts
 * Implements comprehensive validation rules following business domain logic
 */

import { 
  Artifact, 
  Relationship, 
  ArtifactType, 
  RelationshipType,
  artifactSchema,
  isValidArtifactType
} from '../types/artifact.types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Semantic validation rules
 */
export interface ValidationRule {
  name: string;
  description: string;
  validate: (artifact: Artifact, context: ValidationContext) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validation context containing related artifacts and metadata
 */
export interface ValidationContext {
  allArtifacts: Artifact[];
  relationships: Relationship[];
  existingIds: Set<string>;
  typeCounts: Record<ArtifactType, number>;
}

/**
 * Main validation service for artifact semantic validation
 */
export class ValidationService {
  private rules: ValidationRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Validate a single artifact
   */
  async validateArtifact(artifact: Artifact): Promise<ValidationResult> {
    const context = await this.buildValidationContext(artifact);
    
    // Basic schema validation
    const schemaResult = this.validateSchema(artifact);
    if (!schemaResult.isValid) {
      return schemaResult;
    }

    // Semantic validation
    const semanticResult = this.validateSemanticRules(artifact, context);
    
    // Cross-artifact validation
    const crossResult = this.validateCrossArtifactRules(artifact, context);

    // Combine results
    return this.combineValidationResults([schemaResult, semanticResult, crossResult]);
  }

  /**
   * Validate relationships for an artifact
   */
  async validateRelationships(artifact: Artifact): Promise<ValidationResult> {
    const context = await this.buildValidationContext(artifact);
    
    const results = artifact.relationships.map(relationship =>
      this.validateRelationship(relationship, context)
    );

    return this.combineValidationResults(results);
  }

  /**
   * Validate all artifacts in a collection
   */
  async validateCollection(artifacts: Artifact[]): Promise<{
    valid: Artifact[];
    invalid: Array<{ artifact: Artifact; errors: string[] }>;
    warnings: Array<{ artifact: Artifact; warnings: string[] }>;
  }> {
    const context = await this.buildCollectionValidationContext(artifacts);
    
    const results = await Promise.all(
      artifacts.map(async artifact => ({
        artifact,
        validation: await this.validateArtifact(artifact)
      }))
    );

    return {
      valid: results.filter(r => r.validation.isValid).map(r => r.artifact),
      invalid: results.filter(r => !r.validation.isValid).map(r => ({
        artifact: r.artifact,
        errors: r.validation.errors
      })),
      warnings: results.filter(r => r.validation.warnings.length > 0).map(r => ({
        artifact: r.artifact,
        warnings: r.validation.warnings
      }))
    };
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove validation rule
   */
  removeValidationRule(ruleName: string): void {
    this.rules = this.rules.filter(rule => rule.name !== ruleName);
  }

  /**
   * Initialize built-in validation rules
   */
  private initializeRules(): void {
    // Schema validation rule
    this.rules.push({
      name: 'schema_validation',
      description: 'Validate artifact against schema',
      validate: (artifact) => this.validateSchema(artifact),
      severity: 'error'
    });

    // Type validation rule
    this.rules.push({
      name: 'type_validation',
      description: 'Validate artifact type',
      validate: (artifact) => this.validateType(artifact),
      severity: 'error'
    });

    // Relationship validation rule
    this.rules.push({
      name: 'relationship_validation',
      description: 'Validate artifact relationships',
      validate: (artifact, context) => this.validateRelationshipsRule(artifact, context),
      severity: 'warning'
    });

    // Semantic coherence rule
    this.rules.push({
      name: 'semantic_coherence',
      description: 'Validate semantic coherence',
      validate: (artifact, context) => this.validateSemanticCoherence(artifact, context),
      severity: 'warning'
    });

    // Naming convention rule
    this.rules.push({
      name: 'naming_convention',
      description: 'Validate naming conventions',
      validate: (artifact) => this.validateNamingConvention(artifact),
      severity: 'warning'
    });

    // Purpose alignment rule
    this.rules.push({
      name: 'purpose_alignment',
      description: 'Validate purpose alignment with type',
      validate: (artifact) => this.validatePurposeAlignment(artifact),
      severity: 'warning'
    });
  }

  /**
   * Validate artifact against schema
   */
  private validateSchema(artifact: Artifact): ValidationResult {
    const result = artifactSchema.safeParse(artifact);
    
    if (result.success) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };
    }

    const errors = result.error.errors.map(error => 
      `${error.path.join('.')}: ${error.message}`
    );

    return {
      isValid: false,
      errors,
      warnings: [],
      suggestions: this.generateSchemaSuggestions(result.error.errors)
    };
  }

  /**
   * Validate artifact type
   */
  private validateType(artifact: Artifact): ValidationResult {
    if (!isValidArtifactType(artifact.type)) {
      return {
        isValid: false,
        errors: [`Invalid artifact type: ${artifact.type}`],
        warnings: [],
        suggestions: ['Use a valid artifact type from the predefined list']
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
  }

  /**
   * Validate relationships
   */
  private validateRelationshipsRule(artifact: Artifact, context: ValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    artifact.relationships.forEach(relationship => {
      // Validate relationship target exists
      if (!context.existingIds.has(relationship.targetId)) {
        errors.push(`Relationship target not found: ${relationship.targetId}`);
      }

      // Validate relationship type
      if (!this.isValidRelationshipType(relationship.type, artifact.type)) {
        warnings.push(`Relationship type may not be appropriate for ${artifact.type}`);
      }

      // Check for circular references
      if (this.hasCircularReference(artifact.id, relationship.targetId, context.relationships)) {
        errors.push('Circular reference detected');
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate semantic coherence
   */
  private validateSemanticCoherence(artifact: Artifact, context: ValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for orphaned artifacts
    const isReferenced = context.relationships.some(
      rel => rel.targetId === artifact.id || rel.sourceId === artifact.id
    );

    if (!isReferenced && context.allArtifacts.length > 1) {
      warnings.push('Artifact is not connected to any relationships');
      suggestions.push('Consider creating relationships with other artifacts');
    }

    // Validate type-specific rules
    const typeValidation = this.validateTypeSpecificRules(artifact, context);
    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);
    suggestions.push(...typeValidation.suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate naming conventions
   */
  private validateNamingConvention(artifact: Artifact): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (artifact.name.length < 3) {
      errors.push('Artifact name is too short (minimum 3 characters)');
    }

    if (artifact.name.length > 100) {
      errors.push('Artifact name is too long (maximum 100 characters)');
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(artifact.name)) {
      warnings.push('Artifact name contains special characters');
      suggestions.push('Use only alphanumeric characters, spaces, hyphens, and underscores');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate purpose alignment with type
   */
  private validatePurposeAlignment(artifact: Artifact): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (artifact.purpose.length < 10) {
      errors.push('Purpose statement is too short');
      suggestions.push('Provide a more detailed purpose statement (minimum 10 characters)');
    }

    // Type-specific purpose validation
    const typeConfig = ARTIFACT_TYPE_CONFIGS[artifact.type];
    if (typeConfig && typeConfig.defaultPurpose) {
      const similarity = this.calculateSimilarity(artifact.purpose, typeConfig.defaultPurpose);
      if (similarity < 0.3) {
        warnings.push('Purpose may not align well with artifact type');
        suggestions.push(`Consider aligning with: ${typeConfig.defaultPurpose}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Validate a relationship
   */
  private validateRelationship(relationship: Relationship, context: ValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!context.existingIds.has(relationship.sourceId)) {
      errors.push(`Source artifact not found: ${relationship.sourceId}`);
    }

    if (!context.existingIds.has(relationship.targetId)) {
      errors.push(`Target artifact not found: ${relationship.targetId}`);
    }

    if (relationship.sourceId === relationship.targetId) {
      errors.push('Self-referential relationship not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: []
    };
  }

  /**
   * Validate type-specific rules
   */
  private validateTypeSpecificRules(artifact: Artifact, context: ValidationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    switch (artifact.type) {
      case 'purpose':
        if (artifact.description.length < 50) {
          warnings.push('Purpose description should be more detailed');
        }
        break;
      
      case 'vision':
        if (artifact.description.length < 100) {
          warnings.push('Vision description should be more detailed');
        }
        break;
      
      case 'policy':
        if (!artifact.description.includes('must') && !artifact.description.includes('should')) {
          warnings.push('Policy should include clear directives');
          suggestions.push('Use words like "must", "should", or "shall"');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Check if relationship type is valid for artifact type
   */
  private isValidRelationshipType(relationshipType: RelationshipType, artifactType: ArtifactType): boolean {
    const validMappings: Record<ArtifactType, RelationshipType[]> = {
      purpose: ['supports', 'influences', 'implements'],
      vision: ['supports', 'influences'],
      policy: ['implements', 'supports', 'conflicts_with'],
      principle: ['supports', 'influences'],
      guideline: ['supports', 'implements'],
      context: ['contains', 'influences'],
      actor: ['implements', 'supports'],
      concept: ['references', 'contains'],
      process: ['implements', 'contains'],
      procedure: ['implements', 'contains'],
      event: ['influences', 'contains'],
      result: ['implements', 'supports'],
      observation: ['supports', 'references'],
      evaluation: ['supports', 'influences'],
      indicator: ['supports', 'implements'],
      area: ['contains', 'influences'],
      authority: ['supports', 'implements'],
      reference: ['references']
    };

    const validTypes = validMappings[artifactType] || [];
    return validTypes.includes(relationshipType);
  }

  /**
   * Check for circular references
   */
  private hasCircularReference(
    startId: string, 
    targetId: string, 
    relationships: Relationship[]
  ): boolean {
    const visited = new Set<string>();
    const queue = [targetId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (currentId === startId) {
        return true;
      }

      if (visited.has(currentId)) {
        continue;
      }

      visited.add(currentId);

      const nextRelationships = relationships.filter(
        rel => rel.sourceId === currentId
      );

      queue.push(...nextRelationships.map(rel => rel.targetId));
    }

    return false;
  }

  /**
   * Build validation context for single artifact
   */
  private async buildValidationContext(artifact: Artifact): Promise<ValidationContext> {
    // This would typically fetch related artifacts from repository
    // For now, return minimal context
    return {
      allArtifacts: [],
      relationships: artifact.relationships,
      existingIds: new Set([artifact.id]),
      typeCounts: { [artifact.type]: 1 } as Record<ArtifactType, number>
    };
  }

  /**
   * Build validation context for collection
   */
  private async buildCollectionValidationContext(artifacts: Artifact[]): Promise<ValidationContext> {
    const relationships = artifacts.flatMap(a => a.relationships);
    const existingIds = new Set(artifacts.map(a => a.id));
    
    const typeCounts = artifacts.reduce((acc, artifact) => {
      acc[artifact.type] = (acc[artifact.type] || 0) + 1;
      return acc;
    }, {} as Record<ArtifactType, number>);

    return {
      allArtifacts: artifacts,
      relationships,
      existingIds,
      typeCounts
    };
  }

  /**
   * Combine multiple validation results
   */
  private combineValidationResults(results: ValidationResult[]): ValidationResult {
    const errors = results.flatMap(r => r.errors);
    const warnings = results.flatMap(r => r.warnings);
    const suggestions = results.flatMap(r => r.suggestions);

    return {
      isValid: errors.length === 0,
      errors: [...new Set(errors)],
      warnings: [...new Set(warnings)],
      suggestions: [...new Set(suggestions)]
    };
  }

  /**
   * Generate schema validation suggestions
   */
  private generateSchemaSuggestions(errors: any[]): string[] {
    return errors.map(error => {
      if (error.path.includes('name')) {
        return 'Provide a meaningful name for the artifact';
      }
      if (error.path.includes('description')) {
        return 'Add a detailed description explaining the artifact';
      }
      if (error.path.includes('type')) {
        return 'Select an appropriate artifact type from the predefined list';
      }
      return 'Please check the required fields and provide valid values';
    });
  }

  /**
   * Calculate similarity between strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}