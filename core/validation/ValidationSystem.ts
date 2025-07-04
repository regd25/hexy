/**
 * Validation System - Semantic validation for SOL artifacts
 * Ensures semantic coherence, reference integrity, and compliance
 */

import { SOLArtifact, isFoundationalArtifact, isCompositeArtifact } from '../artifacts/SOLArtifact';
import { ArtifactRepository } from '../repositories/ArtifactRepository';
import { 
  ValidationResult, 
  ValidationRule, 
  ValidationRuleResult,
  ValidationCategory,
  createValidationResult 
} from '../types/ValidationResult';

export class ValidationSystem {
  private readonly repository: ArtifactRepository;
  private readonly rules: Map<ValidationCategory, ValidationRule[]>;
  private readonly customRules: ValidationRule[];

  constructor(repository: ArtifactRepository) {
    this.repository = repository;
    this.rules = new Map();
    this.customRules = [];
    this.initializeDefaultRules();
  }

  /**
   * Validates a single SOL artifact
   */
  async validateArtifact(artifact: SOLArtifact): Promise<ValidationResult> {
    const allRules = this.getAllApplicableRules(artifact);
    const results: ValidationRuleResult[] = [];
    
    for (const rule of allRules) {
      try {
        const result = rule.validate(artifact);
        results.push(result);
      } catch (error) {
        results.push({
          passed: false,
          errors: [{
            code: 'VALIDATION_ERROR',
            message: `Validation rule ${rule.id} failed: ${error}`,
            severity: 'high',
            rule: rule.id
          }],
          warnings: [],
          suggestions: []
        });
      }
    }
    
    // Aggregate results
    const errors = results.flatMap(r => r.errors);
    const warnings = results.flatMap(r => r.warnings);
    const suggestions = results.flatMap(r => r.suggestions);
    const isValid = results.every(r => r.passed);
    
    return createValidationResult(isValid, errors, warnings, suggestions);
  }

  /**
   * Validates multiple artifacts and their relationships
   */
  async validateArtifacts(artifacts: SOLArtifact[]): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>();
    
    // First pass: validate individual artifacts
    for (const artifact of artifacts) {
      const result = await this.validateArtifact(artifact);
      results.set(artifact.metadata.id, result);
    }
    
    // Second pass: validate cross-artifact relationships
    await this.validateCrossArtifactRelationships(artifacts, results);
    
    return results;
  }

  /**
   * Add a custom validation rule
   */
  addCustomRule(rule: ValidationRule): void {
    this.customRules.push(rule);
  }

  /**
   * Remove a custom validation rule
   */
  removeCustomRule(ruleId: string): boolean {
    const index = this.customRules.findIndex(rule => rule.id === ruleId);
    if (index >= 0) {
      this.customRules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all rules for a specific category
   */
  getRulesByCategory(category: ValidationCategory): ValidationRule[] {
    return this.rules.get(category) || [];
  }

  /**
   * Enable/disable specific rules
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    // Implementation for enabling/disabling rules
    // This would be used with a configuration system
  }

  // Private methods

  private initializeDefaultRules(): void {
    // Semantic Coherence Rules
    this.addRule('semantic-coherence', {
      id: 'foundational-no-uses',
      name: 'Foundational artifacts cannot use other artifacts',
      description: 'Intent, Context, Authority, and Evaluation artifacts must be independent',
      category: 'semantic-coherence',
      severity: 'critical',
      applicableArtifacts: ['Intent', 'Context', 'Authority', 'Evaluation'],
      validate: (artifact: SOLArtifact) => {
        if (isFoundationalArtifact(artifact) && artifact.uses) {
          return {
            passed: false,
            errors: [{
              code: 'FOUNDATIONAL_USES_VIOLATION',
              message: `Foundational artifact ${artifact.type} cannot use other artifacts`,
              severity: 'critical',
              rule: 'foundational-no-uses'
            }],
            warnings: [],
            suggestions: []
          };
        }
        return { passed: true, errors: [], warnings: [], suggestions: [] };
      }
    });

    this.addRule('semantic-coherence', {
      id: 'composite-requires-uses',
      name: 'Composite artifacts must use foundational artifacts',
      description: 'All non-foundational artifacts must compose foundational artifacts',
      category: 'semantic-coherence',
      severity: 'critical',
      applicableArtifacts: ['Vision', 'Policy', 'Concept', 'Principle', 'Guideline', 'Indicator', 'Process', 'Procedure', 'Event', 'Result', 'Observation', 'Actor', 'Area'],
      validate: (artifact: SOLArtifact) => {
        if (isCompositeArtifact(artifact)) {
          if (!artifact.uses || !artifact.uses.intent || !artifact.uses.context || !artifact.uses.authority) {
            return {
              passed: false,
              errors: [{
                code: 'COMPOSITE_MISSING_USES',
                message: `Composite artifact ${artifact.type} must use intent, context, and authority`,
                severity: 'critical',
                rule: 'composite-requires-uses'
              }],
              warnings: [],
              suggestions: [{
                code: 'ADD_FOUNDATIONAL_USES',
                message: 'Add foundational artifact references in uses block',
                location: { artifact: artifact.metadata.id, section: 'uses' },
                improvement: 'Add uses: { intent: "Intent:Id", context: "Context:Id", authority: "Authority:Id" }',
                benefit: 'Ensures semantic coherence and composability',
                effort: 'low'
              }]
            };
          }
        }
        return { passed: true, errors: [], warnings: [], suggestions: [] };
      }
    });

    // Reference Integrity Rules
    this.addRule('reference-integrity', {
      id: 'semantic-reference-format',
      name: 'Semantic references must follow Type:Id format',
      description: 'All artifact references must use semantic notation',
      category: 'reference-integrity',
      severity: 'high',
      applicableArtifacts: ['*'],
      validate: (artifact: SOLArtifact) => {
        const errors = [];
        const warnings = [];
        
        // Check uses references
        if (artifact.uses) {
          for (const [key, reference] of Object.entries(artifact.uses)) {
            if (reference && !this.isValidSemanticReference(reference)) {
              errors.push({
                code: 'INVALID_SEMANTIC_REFERENCE',
                message: `Invalid semantic reference in uses.${key}: ${reference}`,
                severity: 'high' as const,
                rule: 'semantic-reference-format'
              });
            }
          }
        }
        
        // Check relationship references
        if (artifact.relationships) {
          for (const [key, references] of Object.entries(artifact.relationships)) {
            if (Array.isArray(references)) {
              for (const reference of references) {
                if (!this.isValidSemanticReference(reference)) {
                  errors.push({
                    code: 'INVALID_SEMANTIC_REFERENCE',
                    message: `Invalid semantic reference in relationships.${key}: ${reference}`,
                    severity: 'high' as const,
                    rule: 'semantic-reference-format'
                  });
                }
              }
            }
          }
        }
        
        return { passed: errors.length === 0, errors, warnings, suggestions: [] };
      }
    });

    // Hierarchical Compliance Rules
    this.addRule('hierarchical-compliance', {
      id: 'organizational-level-consistency',
      name: 'Organizational level must be consistent with artifact type',
      description: 'Strategic artifacts must have strategic level, etc.',
      category: 'hierarchical-compliance',
      severity: 'medium',
      applicableArtifacts: ['Vision', 'Policy', 'Concept', 'Principle', 'Guideline', 'Indicator', 'Process', 'Procedure', 'Event', 'Result', 'Observation', 'Actor', 'Area'],
      validate: (artifact: SOLArtifact) => {
        const warnings = [];
        
        if (artifact.organizational) {
          const level = artifact.organizational.level;
          const strategicTypes = ['Vision', 'Policy', 'Concept', 'Principle', 'Guideline', 'Indicator'];
          const operationalTypes = ['Process', 'Procedure', 'Event', 'Result', 'Observation'];
          
          if (strategicTypes.includes(artifact.type) && level !== 'strategic') {
            warnings.push({
              code: 'LEVEL_MISMATCH',
              message: `${artifact.type} artifacts should typically be at strategic level`,
              rule: 'organizational-level-consistency',
              suggestion: 'Consider changing organizational.level to "strategic"',
              impact: 'maintainability' as const
            });
          }
          
          if (operationalTypes.includes(artifact.type) && level === 'strategic') {
            warnings.push({
              code: 'LEVEL_MISMATCH',
              message: `${artifact.type} artifacts should typically be at tactical or operational level`,
              rule: 'organizational-level-consistency',
              suggestion: 'Consider changing organizational.level to "tactical" or "operational"',
              impact: 'maintainability' as const
            });
          }
        }
        
        return { passed: true, errors: [], warnings, suggestions: [] };
      }
    });

    // Flow Validity Rules (for operational artifacts)
    this.addRule('flow-validity', {
      id: 'flow-actor-references',
      name: 'Flow steps must reference valid actors',
      description: 'All actors in flow steps must use Actor:Id notation',
      category: 'flow-validity',
      severity: 'high',
      applicableArtifacts: ['Process', 'Procedure'],
      validate: (artifact: SOLArtifact) => {
        const errors = [];
        
        if (artifact.flow?.steps) {
          for (const step of artifact.flow.steps) {
            if (step.actor && !this.isValidActorReference(step.actor)) {
              errors.push({
                code: 'INVALID_ACTOR_REFERENCE',
                message: `Flow step ${step.id} has invalid actor reference: ${step.actor}`,
                severity: 'high' as const,
                rule: 'flow-actor-references'
              });
            }
          }
        }
        
        return { passed: errors.length === 0, errors, warnings: [], suggestions: [] };
      }
    });

    // Anti-Pattern Detection Rules
    this.addRule('anti-pattern-detection', {
      id: 'no-string-references',
      name: 'Avoid generic string references',
      description: 'Use semantic references instead of generic strings',
      category: 'anti-pattern-detection',
      severity: 'medium',
      applicableArtifacts: ['*'],
      validate: (artifact: SOLArtifact) => {
        const warnings = [];
        const content = JSON.stringify(artifact.content);
        
        // Check for common anti-patterns
        const antiPatterns = [
          { pattern: /\[.*ActorId.*\]/g, message: 'Use Actor:Id instead of [ActorId]' },
          { pattern: /\[.*ContextId.*\]/g, message: 'Use Context:Id instead of [ContextId]' },
          { pattern: /\[.*AuthorityId.*\]/g, message: 'Use Authority:Id instead of [AuthorityId]' }
        ];
        
        for (const { pattern, message } of antiPatterns) {
          if (pattern.test(content)) {
            warnings.push({
              code: 'ANTI_PATTERN_DETECTED',
              message,
              rule: 'no-string-references',
              suggestion: 'Replace with semantic reference',
              impact: 'maintainability' as const
            });
          }
        }
        
        return { passed: true, errors: [], warnings, suggestions: [] };
      }
    });
  }

  private addRule(category: ValidationCategory, rule: ValidationRule): void {
    if (!this.rules.has(category)) {
      this.rules.set(category, []);
    }
    this.rules.get(category)!.push(rule);
  }

  private getAllApplicableRules(artifact: SOLArtifact): ValidationRule[] {
    const applicable: ValidationRule[] = [];
    
    // Add rules from all categories
    for (const categoryRules of this.rules.values()) {
      for (const rule of categoryRules) {
        if (this.isRuleApplicable(rule, artifact)) {
          applicable.push(rule);
        }
      }
    }
    
    // Add custom rules
    for (const rule of this.customRules) {
      if (this.isRuleApplicable(rule, artifact)) {
        applicable.push(rule);
      }
    }
    
    return applicable;
  }

  private isRuleApplicable(rule: ValidationRule, artifact: SOLArtifact): boolean {
    return rule.applicableArtifacts.includes('*') || 
           rule.applicableArtifacts.includes(artifact.type);
  }

  private async validateCrossArtifactRelationships(
    artifacts: SOLArtifact[], 
    results: Map<string, ValidationResult>
  ): Promise<void> {
    // Validate reference integrity across artifacts
    const artifactMap = new Map(artifacts.map(a => [a.metadata.id, a]));
    
    for (const artifact of artifacts) {
      const currentResult = results.get(artifact.metadata.id)!;
      
      // Check if referenced artifacts exist
      if (artifact.uses) {
        for (const [key, reference] of Object.entries(artifact.uses)) {
          if (reference && !await this.referenceExists(reference)) {
            currentResult.errors.push({
              code: 'BROKEN_REFERENCE',
              message: `Referenced artifact not found: ${reference}`,
              severity: 'critical',
              rule: 'cross-artifact-reference-integrity'
            });
            currentResult.isValid = false;
          }
        }
      }
      
      // Check circular dependencies
      const circularDependency = await this.detectCircularDependency(artifact.metadata.id, artifacts);
      if (circularDependency) {
        currentResult.errors.push({
          code: 'CIRCULAR_DEPENDENCY',
          message: `Circular dependency detected: ${circularDependency.join(' -> ')}`,
          severity: 'high',
          rule: 'circular-dependency-detection'
        });
      }
    }
  }

  private isValidSemanticReference(reference: string): boolean {
    // Format: Type:Id
    const regex = /^[A-Z][a-zA-Z]*:[a-zA-Z][a-zA-Z0-9]*$/;
    return regex.test(reference);
  }

  private isValidActorReference(reference: string): boolean {
    // Format: Actor:Id
    return reference.startsWith('Actor:') && this.isValidSemanticReference(reference);
  }

  private async referenceExists(reference: string): Promise<boolean> {
    const artifact = await this.repository.findByReference(reference);
    return artifact !== null;
  }

  private async detectCircularDependency(
    artifactId: string, 
    artifacts: SOLArtifact[], 
    visited: Set<string> = new Set(),
    path: string[] = []
  ): Promise<string[] | null> {
    if (visited.has(artifactId)) {
      // Found a cycle
      const cycleStart = path.indexOf(artifactId);
      return path.slice(cycleStart).concat([artifactId]);
    }
    
    visited.add(artifactId);
    path.push(artifactId);
    
    const artifact = artifacts.find(a => a.metadata.id === artifactId);
    if (!artifact) return null;
    
    // Check dependencies from uses
    if (artifact.uses) {
      for (const reference of Object.values(artifact.uses)) {
        if (reference) {
          const [, dependencyId] = reference.split(':');
          const cycle = await this.detectCircularDependency(dependencyId, artifacts, visited, [...path]);
          if (cycle) return cycle;
        }
      }
    }
    
    // Check dependencies from relationships
    if (artifact.relationships?.dependsOn) {
      for (const reference of artifact.relationships.dependsOn) {
        const [, dependencyId] = reference.split(':');
        const cycle = await this.detectCircularDependency(dependencyId, artifacts, visited, [...path]);
        if (cycle) return cycle;
      }
    }
    
    visited.delete(artifactId);
    path.pop();
    return null;
  }
} 