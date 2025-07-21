/**
 * Validation Rule Engine for Artifacts
 * Extensible validation system for artifacts
 * Follows SOLID principles and framework conventions
 */

import { Artifact } from "../artifacts"
import { ValidationResult } from "./ValidationSystem"

export interface ValidationRule {
  name: string
  description: string
  validate: (artifact: Artifact) => Promise<ValidationResult>
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'structural' | 'semantic' | 'business' | 'compliance'
}

export interface ValidationRuleResult {
  rule: string
  passed: boolean
  errors: string[]
  warnings?: string[]
  executionTime: number
}

export class ValidationRuleEngine {
  private rules: Map<string, ValidationRule> = new Map()
  private ruleResults: Map<string, ValidationRuleResult[]> = new Map()

  constructor() {
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
        if (artifact.type === 'Intent' || artifact.type === 'Context' || 
            artifact.type === 'Authority' || artifact.type === 'Evaluation') {
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

    // Composition validation rules
    this.addRule({
      name: 'composition-structure',
      description: 'Validates composition structure in artifacts',
      priority: 'high',
      category: 'semantic',
      validate: async (artifact: Artifact) => {
        const errors: string[] = []
        
        // Validate that non-foundational artifacts use foundational ones
        if (artifact.type !== 'Intent' && artifact.type !== 'Context' && 
            artifact.type !== 'Authority' && artifact.type !== 'Evaluation') {
          if (!artifact.uses) {
            errors.push('Non-foundational artifacts must use foundational artifacts')
          } else {
            // Check for required foundational references
            const requiredUses = ['intent', 'context', 'authority']
            for (const use of requiredUses) {
              if (!artifact.uses[use as keyof typeof artifact.uses]) {
                errors.push(`Missing required ${use} reference`)
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
            rulesApplied: ['composition-structure']
          }
        }
      }
    })

    // Hierarchy validation rules
    this.addRule({
      name: 'hierarchy-rules',
      description: 'Validates organizational hierarchy rules',
      priority: 'medium',
      category: 'business',
      validate: async (artifact: Artifact) => {
        const errors: string[] = []
        
        // Validate area references
        if (artifact.organizational?.area) {
          const areaRef = artifact.organizational.area
          if (!this.isValidReference(areaRef)) {
            errors.push(`Invalid area reference: ${areaRef}`)
          }
        }

        // Validate actor references
        if (artifact.organizational?.actor) {
          const actorRef = artifact.organizational.actor
          if (!this.isValidReference(actorRef)) {
            errors.push(`Invalid actor reference: ${actorRef}`)
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          metadata: {
            validatedAt: new Date(),
            validatorVersion: '1.0.0',
            rulesApplied: ['hierarchy-rules']
          }
        }
      }
    })

    // Flow semantics validation rules
    this.addRule({
      name: 'flow-semantics',
      description: 'Validates flow semantics in operational artifacts',
      priority: 'medium',
      category: 'semantic',
      validate: async (artifact: Artifact) => {
        const errors: string[] = []
        
        // Validate process flows
        if (artifact.type === 'Process' && artifact.content.flow) {
          const flow = artifact.content.flow
          if (flow.steps) {
            for (const step of flow.steps) {
              if (step.actor && !this.isValidFlowStep(step.actor)) {
                errors.push(`Invalid flow step: ${step.actor}`)
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
            rulesApplied: ['flow-semantics']
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

  private isValidFlowStep(step: string): boolean {
    // Flow step validation: Actor → "action" format
    const pattern = /^[A-Z][a-zA-Z]+:[A-Z][a-zA-Z0-9]*\s*→\s*"[^"]*"$/
    return pattern.test(step)
  }

  public addRule(rule: ValidationRule): void {
    this.rules.set(rule.name, rule)
  }

  public removeRule(name: string): boolean {
    return this.rules.delete(name)
  }

  public getRule(name: string): ValidationRule | undefined {
    return this.rules.get(name)
  }

  public getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values())
  }

  public async validateArtifact(artifact: Artifact): Promise<ValidationResult> {
    const results: ValidationResult[] = []
    const allErrors: string[] = []
    const allWarnings: string[] = []
    const rulesApplied: string[] = []

    // Run all validation rules
    for (const rule of this.rules.values()) {
      try {
        const startTime = Date.now()
        const result = await rule.validate(artifact)
        const executionTime = Date.now() - startTime
        
        results.push(result)
        
        if (result.errors) allErrors.push(...result.errors)
        if (result.warnings) allWarnings.push(...result.warnings)
        if (result.metadata?.rulesApplied) {
          rulesApplied.push(...result.metadata.rulesApplied)
        }

        // Store rule result for analysis
        const ruleResult: ValidationRuleResult = {
          rule: rule.name,
          passed: result.isValid,
          errors: result.errors || [],
          warnings: result.warnings,
          executionTime
        }

        if (!this.ruleResults.has(artifact.metadata.id)) {
          this.ruleResults.set(artifact.metadata.id, [])
        }
        this.ruleResults.get(artifact.metadata.id)!.push(ruleResult)
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

  public getValidationStatistics(): {
    totalRules: number
    totalArtifacts: number
    averageExecutionTime: number
    ruleSuccessRates: Map<string, number>
  } {
    const totalRules = this.rules.size
    const totalArtifacts = this.ruleResults.size
    
    let totalExecutionTime = 0
    let totalExecutions = 0
    const ruleSuccessRates = new Map<string, number>()
    const ruleExecutions = new Map<string, number>()
    const ruleSuccesses = new Map<string, number>()

    // Calculate statistics from stored results
    for (const artifactResults of this.ruleResults.values()) {
      for (const result of artifactResults) {
        totalExecutionTime += result.executionTime
        totalExecutions++

        const currentExecutions = ruleExecutions.get(result.rule) || 0
        const currentSuccesses = ruleSuccesses.get(result.rule) || 0

        ruleExecutions.set(result.rule, currentExecutions + 1)
        if (result.passed) {
          ruleSuccesses.set(result.rule, currentSuccesses + 1)
        }
      }
    }

    // Calculate success rates
    for (const [ruleName, executions] of ruleExecutions) {
      const successes = ruleSuccesses.get(ruleName) || 0
      const successRate = executions > 0 ? (successes / executions) * 100 : 0
      ruleSuccessRates.set(ruleName, successRate)
    }

    return {
      totalRules,
      totalArtifacts,
      averageExecutionTime: totalExecutions > 0 ? totalExecutionTime / totalExecutions : 0,
      ruleSuccessRates
    }
  }

  public clearResults(): void {
    this.ruleResults.clear()
  }
}
