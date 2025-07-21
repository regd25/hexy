/**
 * Validation System for Artifacts
 * Provides comprehensive validation for artifact structure and semantics
 */

import { Artifact, isFoundationalArtifact } from "../artifacts"
import { ValidationRuleEngine } from "./ValidationRuleEngine"

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
  metadata?: {
    validatedAt: Date
    validatorVersion: string
    rulesApplied: string[]
  }
}

export interface ValidationRule {
  name: string
  description: string
  validate: (artifact: Artifact) => Promise<ValidationResult>
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'structural' | 'semantic' | 'business' | 'compliance'
}

export class ValidationSystem {
  private ruleEngine: ValidationRuleEngine
  private validators: Map<string, ValidationRule> = new Map()

  constructor() {
    this.ruleEngine = new ValidationRuleEngine()
    this.initializeDefaultRules()
  }

  private initializeDefaultRules() {
    // Structural validation rules
    this.addRule({
      name: 'artifact-structure',
      description: 'Validates basic artifact structure',
      priority: 'critical',
      category: 'structural',
      validate: async (artifact: Artifact) => {
        const errors: string[] = []
        
        if (!artifact.type) errors.push('Missing artifact type')
        if (!artifact.metadata) errors.push('Missing metadata')
        if (!artifact.content) errors.push('Missing content')
        
        if (artifact.metadata) {
          if (!artifact.metadata.id) errors.push('Missing artifact ID')
          if (!artifact.metadata.version) errors.push('Missing version')
          if (!artifact.metadata.author) errors.push('Missing author')
        }

        return {
          isValid: errors.length === 0,
          errors,
          metadata: {
            validatedAt: new Date(),
            validatorVersion: '1.0.0',
            rulesApplied: ['artifact-structure']
          }
        }
      }
    })

    // Semantic validation rules
    this.addRule({
      name: 'semantic-references',
      description: 'Validates semantic references in artifacts',
      priority: 'high',
      category: 'semantic',
      validate: async (artifact: Artifact) => {
        const errors: string[] = []
        
        // Validate uses references
        if (artifact.uses) {
          const requiredUses = ['intent', 'context', 'authority', 'evaluation']
          for (const use of requiredUses) {
            if (artifact.uses[use as keyof typeof artifact.uses]) {
              const reference = artifact.uses[use as keyof typeof artifact.uses]
              if (!this.isValidReference(reference)) {
                errors.push(`Invalid ${use} reference: ${reference}`)
              }
            }
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          metadata: {
            validatedAt: new Date(),
            validatorVersion: '1.0.0',
            rulesApplied: ['semantic-references']
          }
        }
      }
    })

    // Business validation rules
    this.addRule({
      name: 'business-coherence',
      description: 'Validates business logic coherence',
      priority: 'medium',
      category: 'business',
      validate: async (artifact: Artifact) => {
        const errors: string[] = []
        
        // Validate foundational artifacts have required content
        if (isFoundationalArtifact(artifact)) {
          if (!artifact.content.statement && artifact.type !== 'Context') {
            errors.push('Foundational artifacts must have a statement')
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          metadata: {
            validatedAt: new Date(),
            validatorVersion: '1.0.0',
            rulesApplied: ['business-coherence']
          }
        }
      }
    })
  }

  private isValidReference(reference: string): boolean {
    // Basic reference validation: Type:Id format
    const pattern = /^[A-Z][a-zA-Z]+:[A-Z][a-zA-Z0-9]*$/
    return pattern.test(reference)
  }

  public addRule(rule: ValidationRule): void {
    this.validators.set(rule.name, rule)
  }

  public async validateArtifact(artifact: Artifact): Promise<ValidationResult> {
    const results: ValidationResult[] = []
    const allErrors: string[] = []
    const allWarnings: string[] = []
    const rulesApplied: string[] = []

    // Run all validation rules
    for (const rule of this.validators.values()) {
      try {
        const result = await rule.validate(artifact)
        results.push(result)
        
        if (result.errors) allErrors.push(...result.errors)
        if (result.warnings) allWarnings.push(...result.warnings)
        if (result.metadata?.rulesApplied) {
          rulesApplied.push(...result.metadata.rulesApplied)
        }
      } catch (error) {
        allErrors.push(`Validation rule '${rule.name}' failed: ${error}`)
      }
    }

    // Determine overall validity
    const isValid = allErrors.length === 0

    return {
      isValid,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
      metadata: {
        validatedAt: new Date(),
        validatorVersion: '1.0.0',
        rulesApplied: [...new Set(rulesApplied)]
      }
    }
  }

  public async validateArtifacts(artifacts: Artifact[]): Promise<ValidationResult[]> {
    return Promise.all(artifacts.map(artifact => this.validateArtifact(artifact)))
  }

  public getValidationRules(): ValidationRule[] {
    return Array.from(this.validators.values())
  }

  public getRuleByName(name: string): ValidationRule | undefined {
    return this.validators.get(name)
  }
}
