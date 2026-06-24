/**
 * ValidationService — validación semántica según los principios del framework Hexy:
 * alineación purpose-context, legitimidad de autoridad y coherencia de criterios de evaluación.
 * Portado de dashboard/artifacts/services/ValidationService.ts. La validación de esquema por
 * zod se reemplaza por chequeos manuales ligeros (el backend no depende de zod).
 */

import { ARTIFACT_TYPES, ARTIFACT_TYPE_VALUES, ARTIFACT_TYPE_CONFIGS, RELATION_TYPES } from './constants.js'

const ok = (semanticScore = 1.0) => ({ isValid: true, errors: [], warnings: [], suggestions: [], semanticScore })

export class ValidationService {
    constructor() {
        this.semanticRules = this.#buildSemanticRules()
        this.businessRules = this.#buildBusinessRules()
    }

    /** Validación completa de un artefacto (esquema + reglas semánticas + reglas de negocio). */
    async validateArtifact(artifact) {
        const results = [this.#validateSchema(artifact)]
        for (const rule of this.semanticRules) results.push(rule.validate(artifact))
        for (const rule of this.businessRules) if (rule.applies(artifact)) results.push(rule.validate(artifact))
        return this.#combine(results)
    }

    /** Validación relajada para artefactos temporales (en creación/edición). */
    async validateTemporalArtifact(temporal) {
        const artifact = { ...temporal, type: temporal.type ?? ARTIFACT_TYPES.CONCEPT, version: '1.0.0' }
        return this.validatePartialArtifact(artifact)
    }

    /** Coherencia semántica de una relación (compatibilidad de tipos source/target). */
    async validateRelationship(relationship, sourceArtifact, targetArtifact) {
        const errors = []
        const warnings = []
        const suggestions = []

        if (!relationship || !relationship.sourceId || !relationship.targetId || !relationship.type) {
            errors.push({ field: 'relationship', message: 'Relationship schema validation failed', code: 'SCHEMA_INVALID', severity: 'error' })
        }

        if (sourceArtifact && targetArtifact) {
            const coherence = this.#validateRelationshipCoherence(relationship, sourceArtifact, targetArtifact)
            warnings.push(...coherence.warnings)
            suggestions.push(...coherence.suggestions)
        }

        return { isValid: errors.length === 0, errors, warnings, suggestions, semanticScore: this.#relationshipScore(relationship) }
    }

    validatePurposeContextAlignment(purpose = '', context = {}) {
        const errors = []
        const warnings = []
        const suggestions = []

        if (purpose.length < 10) {
            errors.push({ field: 'purpose', message: 'Purpose must be clearly articulated with at least 10 characters', code: 'PURPOSE_TOO_SHORT', severity: 'error' })
        }
        if (purpose.length > 500) {
            warnings.push({ field: 'purpose', message: 'Purpose should be concise. Consider breaking into multiple artifacts.', suggestion: 'Refactor into smaller, focused purposes' })
        }

        const requiredContextKeys = ['domain', 'timeframe', 'stakeholders']
        const missing = requiredContextKeys.filter((k) => !(k in context))
        if (missing.length > 0) {
            warnings.push({ field: 'context', message: `Missing recommended context: ${missing.join(', ')}`, suggestion: 'Add domain, timeframe, and stakeholders for better context' })
        }

        const alignment = this.#purposeContextAlignment(purpose, context)
        if (alignment < 0.6) {
            warnings.push({ field: 'alignment', message: 'Purpose and context may not be well aligned', suggestion: 'Review context to ensure it supports the stated purpose' })
        }

        suggestions.push({
            field: 'purpose',
            suggestion: 'Consider using action-oriented language that clearly states the intended outcome',
            reasoning: 'Clear, actionable purposes improve organizational understanding',
            confidence: 0.8,
        })

        return { isValid: errors.length === 0, errors, warnings, suggestions, semanticScore: alignment }
    }

    validateAuthorityLegitimacy(authority = '', artifactType) {
        const errors = []
        const warnings = []
        const suggestions = []

        if (!authority || authority.trim().length === 0) {
            errors.push({ field: 'authority', message: 'Authority must be specified for organizational legitimacy', code: 'AUTHORITY_MISSING', severity: 'error' })
        }

        const appropriate = this.#appropriateAuthorities(artifactType)
        const isAppropriate = appropriate.some((a) => authority.toLowerCase().includes(a.toLowerCase()))
        if (!isAppropriate && appropriate.length > 0) {
            warnings.push({ field: 'authority', message: `Authority may not be appropriate for ${artifactType} artifacts`, suggestion: `Consider: ${appropriate.join(', ')}` })
        }

        const generic = ['management', 'team', 'organization', 'company']
        if (generic.some((g) => authority.toLowerCase().includes(g))) {
            suggestions.push({ field: 'authority', suggestion: 'Consider specifying a more specific authority role or position', reasoning: 'Specific authority improves accountability and legitimacy', confidence: 0.7 })
        }

        return { isValid: errors.length === 0, errors, warnings, suggestions, semanticScore: isAppropriate ? 0.9 : 0.6 }
    }

    validateEvaluationCoherence(criteria = [], purpose = '') {
        const errors = []
        const warnings = []
        const suggestions = []

        if (!criteria || criteria.length === 0) {
            errors.push({ field: 'evaluationCriteria', message: 'Evaluation criteria must be defined to assess purpose fulfillment', code: 'CRITERIA_MISSING', severity: 'error' })
        }

        if (criteria.length > 0) {
            if (criteria.some((c) => c.length < 5)) {
                warnings.push({ field: 'evaluationCriteria', message: 'Some evaluation criteria are too brief to be meaningful', suggestion: 'Expand criteria to clearly describe what success looks like' })
            }
            if (this.#criteriaPurposeAlignment(criteria, purpose) < 0.6) {
                warnings.push({ field: 'evaluationCriteria', message: 'Evaluation criteria may not align well with the stated purpose', suggestion: 'Review criteria to ensure they measure purpose achievement' })
            }
            const measurable = criteria.filter((c) => this.#isMeasurable(c))
            if (measurable.length < criteria.length * 0.5) {
                suggestions.push({ field: 'evaluationCriteria', suggestion: 'Consider making more criteria measurable with specific metrics', reasoning: 'Measurable criteria enable objective evaluation', confidence: 0.8 })
            }
        }

        return { isValid: errors.length === 0, errors, warnings, suggestions, semanticScore: this.#evaluationCoherence(criteria) }
    }

    validatePartialArtifact(artifact) {
        const errors = []
        const suggestions = []

        if (!artifact.name || artifact.name.trim().length === 0) {
            errors.push({ field: 'name', message: 'VisualArtifact name is required', code: 'NAME_REQUIRED', severity: 'error' })
        }
        if (artifact.type == null) {
            errors.push({ field: 'type', message: 'VisualArtifact type is required', code: 'TYPE_REQUIRED', severity: 'error' })
        } else if (!ARTIFACT_TYPE_VALUES.includes(artifact.type)) {
            errors.push({ field: 'type', message: 'VisualArtifact type is invalid', code: 'TYPE_INVALID', severity: 'error' })
        }
        if (!artifact.purpose || artifact.purpose.length < 10) {
            suggestions.push({ field: 'purpose', suggestion: 'Add a clear purpose statement to improve semantic clarity', reasoning: 'Purpose is fundamental to Hexy semantic architecture', confidence: 0.9 })
        }

        return { isValid: errors.length === 0, errors, warnings: [], suggestions, semanticScore: errors.length === 0 ? 0.7 : 0.3 }
    }

    // --- Reglas ---
    #buildSemanticRules() {
        return [
            { name: 'Purpose Clarity', weight: 0.9, validate: (a) => this.validatePurposeContextAlignment(a.purpose, a.context) },
            { name: 'Authority Legitimacy', weight: 0.8, validate: (a) => this.validateAuthorityLegitimacy(a.authority, a.type) },
            { name: 'Evaluation Coherence', weight: 0.85, validate: (a) => this.validateEvaluationCoherence(a.evaluationCriteria, a.purpose) },
            { name: 'Semantic Metadata Quality', weight: 0.7, validate: (a) => this.#validateSemanticMetadata(a) },
        ]
    }

    #buildBusinessRules() {
        return [
            {
                id: 'strategic_authority',
                applies: (a) => [ARTIFACT_TYPES.VISION, ARTIFACT_TYPES.POLICY, ARTIFACT_TYPES.PRINCIPLE].includes(a.type),
                validate: (a) => {
                    const executive = ['executive', 'ceo', 'board', 'leadership', 'strategic']
                    const has = executive.some((t) => (a.authority ?? '').toLowerCase().includes(t))
                    return has
                        ? ok(1.0)
                        : { isValid: false, errors: [], warnings: [{ field: 'authority', message: 'Strategic artifacts typically require executive-level authority', suggestion: 'Consider executive leadership or board-level authority' }], suggestions: [], semanticScore: 0.5 }
                },
            },
            {
                id: 'operational_specificity',
                applies: (a) => [ARTIFACT_TYPES.PROCESS, ARTIFACT_TYPES.PROCEDURE, ARTIFACT_TYPES.EVENT].includes(a.type),
                validate: (a) => {
                    const hasAction = /\b(create|update|delete|process|execute|perform|implement)\b/i.test(a.description ?? '')
                    return hasAction
                        ? ok(1.0)
                        : {
                              isValid: false,
                              errors: [{ field: 'description', message: 'Operational artifacts must include specific action words', code: 'OPERATIONAL_NOT_ACTIONABLE', severity: 'error' }],
                              warnings: [],
                              suggestions: [{ field: 'description', suggestion: 'Include action verbs like create, update, process, execute', reasoning: 'Operational artifacts should clearly describe what actions are taken', confidence: 0.9 }],
                              semanticScore: 0.3,
                          }
                },
            },
        ]
    }

    #validateSchema(artifact) {
        const errors = []
        if (!artifact.name || artifact.name.length < 1) errors.push({ field: 'name', message: 'name is required', code: 'SCHEMA_VALIDATION', severity: 'error' })
        if (!ARTIFACT_TYPE_VALUES.includes(artifact.type)) errors.push({ field: 'type', message: 'invalid type', code: 'SCHEMA_VALIDATION', severity: 'error' })
        if (!artifact.description || artifact.description.length < 10) errors.push({ field: 'description', message: 'description must be at least 10 chars', code: 'SCHEMA_VALIDATION', severity: 'error' })
        if (errors.length > 0) return { isValid: false, errors, warnings: [], suggestions: [], semanticScore: 0.0 }
        return ok(1.0)
    }

    #validateSemanticMetadata(artifact) {
        const warnings = []
        const suggestions = []
        const m = artifact.semanticMetadata ?? {}
        if ((m.businessValue ?? 0) < 1 || (m.businessValue ?? 0) > 10) {
            warnings.push({ field: 'semanticMetadata.businessValue', message: 'Business value should be between 1 and 10', suggestion: 'Set a realistic business value score' })
        }
        if ((m.stakeholders ?? []).length === 0) {
            suggestions.push({ field: 'semanticMetadata.stakeholders', suggestion: 'Identify key stakeholders for this artifact', reasoning: 'Stakeholder identification improves organizational alignment', confidence: 0.8 })
        }
        if ((m.semanticTags ?? []).length === 0) {
            suggestions.push({ field: 'semanticMetadata.semanticTags', suggestion: 'Add semantic tags to improve discoverability', reasoning: 'Tags enable better search and categorization', confidence: 0.7 })
        }
        return { isValid: true, errors: [], warnings, suggestions, semanticScore: 0.8 }
    }

    #validateRelationshipCoherence(relationship, source, target) {
        const warnings = []
        const compatible = this.#typesCompatible(source.type, target.type, relationship.type)
        if (!compatible) {
            warnings.push({ field: 'relationship.type', message: `${relationship.type} relationship may not be semantically appropriate between ${source.type} and ${target.type}`, suggestion: 'Consider a different relationship type or review artifact types' })
        }
        return { isValid: true, errors: [], warnings, suggestions: [], semanticScore: compatible ? 0.8 : 0.5 }
    }

    // --- Heurísticas ---
    #purposeContextAlignment(purpose, context) {
        const contextScore = Math.min(Object.keys(context ?? {}).length / 5, 1)
        const purposeScore = Math.min((purpose ?? '').length / 100, 1)
        return (contextScore + purposeScore) / 2
    }

    #evaluationCoherence(criteria) {
        if (!criteria || criteria.length === 0) return 0.0
        const avgLen = criteria.reduce((s, c) => s + c.length, 0) / criteria.length
        const lengthScore = Math.min(avgLen / 20, 1)
        const measurable = criteria.filter((c) => this.#isMeasurable(c)).length / criteria.length
        return (lengthScore + measurable) / 2
    }

    #relationshipScore(relationship) {
        let score = 0.5
        if ((relationship?.semanticStrength ?? 0) > 0.7) score += 0.2
        if (relationship?.businessImpact === 'high') score += 0.2
        if (relationship?.validationStatus === 'valid') score += 0.1
        return Math.min(score, 1.0)
    }

    #appropriateAuthorities(artifactType) {
        const config = ARTIFACT_TYPE_CONFIGS[artifactType]
        if (config?.defaultAuthority) return [config.defaultAuthority]
        const strategic = [ARTIFACT_TYPES.VISION, ARTIFACT_TYPES.POLICY, ARTIFACT_TYPES.PRINCIPLE]
        const operational = [ARTIFACT_TYPES.PROCESS, ARTIFACT_TYPES.PROCEDURE, ARTIFACT_TYPES.EVENT]
        if (strategic.includes(artifactType)) return ['Executive Leadership', 'Board of Directors', 'Strategic Planning']
        if (operational.includes(artifactType)) return ['Operations Manager', 'Process Owner', 'Team Lead']
        return ['Department Head', 'Project Manager', 'Subject Matter Expert']
    }

    #isMeasurable(criteria) {
        const words = ['measure', 'metric', 'count', 'percentage', 'time', 'cost', 'quality', 'quantity']
        return words.some((w) => criteria.toLowerCase().includes(w))
    }

    #criteriaPurposeAlignment(criteria, purpose) {
        if (!criteria || criteria.length === 0) return 0.0
        const purposeWords = (purpose ?? '').toLowerCase().split(/\s+/)
        const scores = criteria.map((criterion) => {
            const cWords = criterion.toLowerCase().split(/\s+/)
            const common = purposeWords.filter((w) => cWords.some((cw) => cw.includes(w) || w.includes(cw)))
            return common.length / Math.max(purposeWords.length, cWords.length)
        })
        return scores.reduce((s, v) => s + v, 0) / scores.length
    }

    #typesCompatible(sourceType, targetType, relationshipType) {
        const rules = {
            [RELATION_TYPES.IMPLEMENTS]: {
                source: [ARTIFACT_TYPES.PROCESS, ARTIFACT_TYPES.PROCEDURE],
                target: [ARTIFACT_TYPES.POLICY, ARTIFACT_TYPES.PRINCIPLE, ARTIFACT_TYPES.GUIDELINE],
            },
            [RELATION_TYPES.SUPPORTS]: {
                source: [ARTIFACT_TYPES.PROCESS, ARTIFACT_TYPES.ACTOR, ARTIFACT_TYPES.AREA],
                target: [ARTIFACT_TYPES.INTENT, ARTIFACT_TYPES.VISION, ARTIFACT_TYPES.POLICY],
            },
            [RELATION_TYPES.DEPENDS_ON]: {
                source: [ARTIFACT_TYPES.PROCESS, ARTIFACT_TYPES.PROCEDURE, ARTIFACT_TYPES.RESULT],
                target: [ARTIFACT_TYPES.PROCESS, ARTIFACT_TYPES.ACTOR, ARTIFACT_TYPES.AREA],
            },
            [RELATION_TYPES.INFLUENCES]: {
                source: [ARTIFACT_TYPES.POLICY, ARTIFACT_TYPES.PRINCIPLE, ARTIFACT_TYPES.GUIDELINE],
                target: [ARTIFACT_TYPES.PROCESS, ARTIFACT_TYPES.PROCEDURE, ARTIFACT_TYPES.RESULT],
            },
        }
        const rule = rules[relationshipType]
        if (!rule) return true
        return rule.source.includes(sourceType) && rule.target.includes(targetType)
    }

    #combine(results) {
        const errors = results.flatMap((r) => r.errors)
        const warnings = results.flatMap((r) => r.warnings)
        const suggestions = results.flatMap((r) => r.suggestions)
        const avg = results.length > 0 ? results.reduce((s, r) => s + r.semanticScore, 0) / results.length : 0
        return { isValid: errors.length === 0, errors, warnings, suggestions, semanticScore: avg }
    }
}
