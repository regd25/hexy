/**
 * Validation System for SOL Artifacts
 * Provides comprehensive validation rules and integrity checks
 */

import { SOLArtifact, isFoundationalArtifact } from "../artifacts"
import { ArtifactRepository } from "../repositories/ArtifactRepository"
import {
  ValidationResult,
  ValidationRule,
  ValidationRuleResult,
  ValidationCategory,
  createValidationResult,
} from "../types/Result"

export class ValidationSystem {
  private readonly repository: ArtifactRepository
  private readonly rules: Map<ValidationCategory, ValidationRule[]>
  private readonly customRules: ValidationRule[]

  constructor(repository: ArtifactRepository) {
    this.repository = repository
    this.rules = new Map()
    this.customRules = []
    this.initializeDefaultRules()
  }

  /**
   * Validates a single artifact
   */
  async validateArtifact(artifact: SOLArtifact): Promise<ValidationResult> {
    const allRules = this.getAllApplicableRules(artifact)
    const results: ValidationRuleResult[] = []

    for (const rule of allRules) {
      try {
        const result = await rule.validate(artifact)
        results.push(result)
      } catch (error) {
        results.push({
          passed: false,
          errors: [
            {
              code: "VALIDATION_ERROR",
              message: `Validation rule ${rule.id} failed: ${error}`,
              severity: "high",
              rule: rule.id,
            },
          ],
          warnings: [],
          suggestions: [],
        })
      }
    }

    // Aggregate results
    const errors = results.flatMap((r) => r.errors)
    const warnings = results.flatMap((r) => r.warnings)
    const suggestions = results.flatMap((r) => r.suggestions)
    const isValid = results.every((r) => r.passed)

    return createValidationResult(isValid, errors, warnings, suggestions)
  }

  /**
   * Validates multiple artifacts and their relationships
   */
  async validateArtifacts(
    artifacts: SOLArtifact[]
  ): Promise<Map<string, ValidationResult>> {
    const results = new Map<string, ValidationResult>()

    // Validate individual artifacts
    for (const artifact of artifacts) {
      const result = await this.validateArtifact(artifact)
      results.set(artifact.metadata.id, result)
    }

    return results
  }

  /**
   * Adds a custom validation rule
   */
  addCustomRule(rule: ValidationRule): void {
    this.customRules.push(rule)
  }

  /**
   * Removes a custom validation rule
   */
  removeCustomRule(ruleId: string): boolean {
    const index = this.customRules.findIndex((rule) => rule.id === ruleId)
    if (index >= 0) {
      this.customRules.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * Gets rules for a specific category
   */
  getRulesByCategory(category: ValidationCategory): ValidationRule[] {
    return this.rules.get(category) || []
  }

  /**
   * Toggle a rule on/off
   */
  toggleRule(_ruleId: string, _enabled: boolean): void {
    // Implementation for toggling rules
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Basic foundational artifact rule
    this.addRule("semantic-coherence", {
      id: "foundational-no-uses",
      name: "Foundational artifacts cannot use other artifacts",
      description:
        "Intent, Context, Authority, and Evaluation artifacts must be independent",
      category: "semantic-coherence",
      severity: "critical",
      applicableArtifacts: ["Intent", "Context", "Authority", "Evaluation"],
      validate: async (artifact: SOLArtifact) => {
        if (isFoundationalArtifact(artifact) && artifact.uses) {
          return {
            passed: false,
            errors: [
              {
                code: "FOUNDATIONAL_USES_VIOLATION",
                message: `Foundational artifact ${artifact.type} cannot use other artifacts`,
                severity: "critical",
                rule: "foundational-no-uses",
              },
            ],
            warnings: [],
            suggestions: [],
          }
        }
        return { passed: true, errors: [], warnings: [], suggestions: [] }
      },
    })

    // Basic metadata validation
    this.addRule("semantic-coherence", {
      id: "required-metadata",
      name: "Required metadata fields must be present",
      description: "All artifacts must have required metadata fields",
      category: "semantic-coherence",
      severity: "critical",
      applicableArtifacts: ["*"],
      validate: async (artifact: SOLArtifact) => {
        const errors = []

        if (!artifact.metadata.id) {
          errors.push({
            code: "MISSING_METADATA",
            message: "Artifact must have an ID",
            severity: "critical" as const,
            rule: "required-metadata",
          })
        }

        if (!artifact.metadata.version) {
          errors.push({
            code: "MISSING_METADATA",
            message: "Artifact must have a version",
            severity: "critical" as const,
            rule: "required-metadata",
          })
        }

        return {
          passed: errors.length === 0,
          errors,
          warnings: [],
          suggestions: [],
        }
      },
    })
  }

  private addRule(category: ValidationCategory, rule: ValidationRule): void {
    if (!this.rules.has(category)) {
      this.rules.set(category, [])
    }
    this.rules.get(category)!.push(rule)
  }

  private getAllApplicableRules(artifact: SOLArtifact): ValidationRule[] {
    const applicable: ValidationRule[] = []

    // Add rules from all categories
    for (const categoryRules of this.rules.values()) {
      for (const rule of categoryRules) {
        if (this.isRuleApplicable(rule, artifact)) {
          applicable.push(rule)
        }
      }
    }

    // Add custom rules
    for (const rule of this.customRules) {
      if (this.isRuleApplicable(rule, artifact)) {
        applicable.push(rule)
      }
    }

    return applicable
  }

  private isRuleApplicable(
    rule: ValidationRule,
    artifact: SOLArtifact
  ): boolean {
    return (
      rule.applicableArtifacts.includes("*") ||
      rule.applicableArtifacts.includes(artifact.type)
    )
  }
}
