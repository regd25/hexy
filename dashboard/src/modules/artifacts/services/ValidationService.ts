/**
 * ValidationService - Semantic validation following Hexy Framework principles
 * Implements purpose-context alignment, authority legitimacy, and evaluation coherence
 */

import {
    Artifact,
    TemporalArtifact,
    Relationship,
    ArtifactType,
    RelationshipType,
    ValidationResult,
    ValidationError,
    ValidationWarning,
    ValidationSuggestion,
    ARTIFACT_TYPES,
    ARTIFACT_TYPE_CONFIGS,
    RELATIONSHIP_TYPES,
    artifactSchema,
    relationshipSchema,
} from '../types'

/**
 * Semantic validation rules for Hexy Framework
 */
interface SemanticValidationRule {
    name: string
    description: string
    validate: (artifact: Artifact) => ValidationResult
    weight: number // Importance weight (0-1)
}

/**
 * Business rule validation interface
 */
interface BusinessRule {
    id: string
    name: string
    description: string
    applies: (artifact: Artifact) => boolean
    validate: (artifact: Artifact) => ValidationResult
    severity: 'error' | 'warning'
}

/**
 * Validation service implementing Hexy semantic principles
 */
export class ValidationService {
    private semanticRules: SemanticValidationRule[] = []
    private businessRules: BusinessRule[] = []

    constructor() {
        this.initializeSemanticRules()
        this.initializeBusinessRules()
    }

    /**
     * Validate artifact with comprehensive semantic analysis
     */
    async validateArtifact(artifact: Artifact): Promise<ValidationResult> {
        const results: ValidationResult[] = []

        // Schema validation
        results.push(this.validateSchema(artifact))

        // Semantic validation
        for (const rule of this.semanticRules) {
            results.push(rule.validate(artifact))
        }

        // Business rule validation
        for (const rule of this.businessRules) {
            if (rule.applies(artifact)) {
                results.push(rule.validate(artifact))
            }
        }

        // Combine results
        return this.combineValidationResults(results)
    }

    /**
     * Validate temporal artifact during creation/editing
     */
    async validateTemporalArtifact(
        temporal: TemporalArtifact
    ): Promise<ValidationResult> {
        // Convert temporal to artifact for validation
        const artifact: Partial<Artifact> = {
            ...temporal,
            id: temporal.id || crypto.randomUUID(),
            version: '1.0.0',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        // Validate with relaxed rules for temporal artifacts
        return this.validatePartialArtifact(artifact)
    }

    /**
     * Validate relationship semantic coherence
     */
    async validateRelationship(
        relationship: Relationship,
        sourceArtifact?: Artifact,
        targetArtifact?: Artifact
    ): Promise<ValidationResult> {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        // Schema validation
        const schemaResult = relationshipSchema.safeParse(relationship)
        if (!schemaResult.success) {
            errors.push({
                field: 'relationship',
                message: 'Relationship schema validation failed',
                code: 'SCHEMA_INVALID',
                severity: 'error',
            })
        }

        // Semantic coherence validation
        if (sourceArtifact && targetArtifact) {
            const coherenceResult = this.validateRelationshipSemanticCoherence(
                relationship,
                sourceArtifact,
                targetArtifact
            )
            errors.push(...coherenceResult.errors)
            warnings.push(...coherenceResult.warnings)
            suggestions.push(...coherenceResult.suggestions)
        }

        // Calculate semantic score
        const semanticScore = this.calculateRelationshipSemanticScore(
            relationship
        )

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            semanticScore,
        }
    }

    /**
     * Validate purpose-context alignment (Hexy foundational principle)
     */
    validatePurposeContextAlignment(
        purpose: string,
        context: Record<string, unknown>
    ): ValidationResult {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        // Purpose clarity validation
        if (purpose.length < 10) {
            errors.push({
                field: 'purpose',
                message:
                    'Purpose must be clearly articulated with at least 10 characters',
                code: 'PURPOSE_TOO_SHORT',
                severity: 'error',
            })
        }

        if (purpose.length > 500) {
            warnings.push({
                field: 'purpose',
                message:
                    'Purpose should be concise. Consider breaking into multiple artifacts.',
                suggestion: 'Refactor into smaller, focused purposes',
            })
        }

        // Context completeness validation
        const requiredContextKeys = ['domain', 'timeframe', 'stakeholders']
        const missingKeys = requiredContextKeys.filter(key => !(key in context))

        if (missingKeys.length > 0) {
            warnings.push({
                field: 'context',
                message: `Missing recommended context: ${missingKeys.join(', ')}`,
                suggestion:
                    'Add domain, timeframe, and stakeholders for better context',
            })
        }

        // Purpose-context semantic alignment
        const alignmentScore = this.calculatePurposeContextAlignment(
            purpose,
            context
        )
        if (alignmentScore < 0.6) {
            warnings.push({
                field: 'alignment',
                message: 'Purpose and context may not be well aligned',
                suggestion:
                    'Review context to ensure it supports the stated purpose',
            })
        }

        // Provide alignment suggestions
        suggestions.push({
            field: 'purpose',
            suggestion:
                'Consider using action-oriented language that clearly states the intended outcome',
            reasoning:
                'Clear, actionable purposes improve organizational understanding',
            confidence: 0.8,
        })

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            semanticScore: alignmentScore,
        }
    }

    /**
     * Validate authority legitimacy (Hexy foundational principle)
     */
    validateAuthorityLegitimacy(
        authority: string,
        artifactType: ArtifactType
    ): ValidationResult {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        // Authority presence validation
        if (!authority || authority.trim().length === 0) {
            errors.push({
                field: 'authority',
                message:
                    'Authority must be specified for organizational legitimacy',
                code: 'AUTHORITY_MISSING',
                severity: 'error',
            })
        }

        // Authority appropriateness for artifact type
        const appropriateAuthorities =
            this.getAppropriateAuthorities(artifactType)
        const isAppropriate = appropriateAuthorities.some(auth =>
            authority.toLowerCase().includes(auth.toLowerCase())
        )

        if (!isAppropriate && appropriateAuthorities.length > 0) {
            warnings.push({
                field: 'authority',
                message: `Authority may not be appropriate for ${artifactType} artifacts`,
                suggestion: `Consider: ${appropriateAuthorities.join(', ')}`,
            })
        }

        // Authority specificity
        const genericAuthorities = [
            'management',
            'team',
            'organization',
            'company',
        ]
        const isGeneric = genericAuthorities.some(generic =>
            authority.toLowerCase().includes(generic)
        )

        if (isGeneric) {
            suggestions.push({
                field: 'authority',
                suggestion:
                    'Consider specifying a more specific authority role or position',
                reasoning:
                    'Specific authority improves accountability and legitimacy',
                confidence: 0.7,
            })
        }

        const legitimacyScore = this.calculateAuthorityLegitimacy(
            authority,
            artifactType
        )

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            semanticScore: legitimacyScore,
        }
    }

    /**
     * Validate evaluation criteria coherence (Hexy foundational principle)
     */
    validateEvaluationCoherence(
        criteria: string[],
        purpose: string
    ): ValidationResult {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        // Criteria presence validation
        if (!criteria || criteria.length === 0) {
            errors.push({
                field: 'evaluationCriteria',
                message:
                    'Evaluation criteria must be defined to assess purpose fulfillment',
                code: 'CRITERIA_MISSING',
                severity: 'error',
            })
        }

        // Criteria quality validation
        if (criteria.length > 0) {
            const shortCriteria = criteria.filter(c => c.length < 5)
            if (shortCriteria.length > 0) {
                warnings.push({
                    field: 'evaluationCriteria',
                    message:
                        'Some evaluation criteria are too brief to be meaningful',
                    suggestion:
                        'Expand criteria to clearly describe what success looks like',
                })
            }

            // Criteria-purpose alignment
            const alignmentScore = this.calculateCriteriaPurposeAlignment(
                criteria,
                purpose
            )
            if (alignmentScore < 0.6) {
                warnings.push({
                    field: 'evaluationCriteria',
                    message:
                        'Evaluation criteria may not align well with the stated purpose',
                    suggestion:
                        'Review criteria to ensure they measure purpose achievement',
                })
            }

            // Measurability assessment
            const measurableCriteria = criteria.filter(c =>
                this.isMeasurable(c)
            )
            if (measurableCriteria.length < criteria.length * 0.5) {
                suggestions.push({
                    field: 'evaluationCriteria',
                    suggestion:
                        'Consider making more criteria measurable with specific metrics',
                    reasoning:
                        'Measurable criteria enable objective evaluation',
                    confidence: 0.8,
                })
            }
        }

        const coherenceScore = this.calculateEvaluationCoherence(criteria)

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            semanticScore: coherenceScore,
        }
    }

    /**
     * Initialize semantic validation rules
     */
    private initializeSemanticRules(): void {
        this.semanticRules = [
            {
                name: 'Purpose Clarity',
                description:
                    'Validates that the artifact purpose is clear and actionable',
                weight: 0.9,
                validate: (artifact: Artifact) => {
                    return this.validatePurposeContextAlignment(
                        artifact.purpose,
                        artifact.context
                    )
                },
            },
            {
                name: 'Authority Legitimacy',
                description:
                    'Validates that the authority is appropriate and legitimate',
                weight: 0.8,
                validate: (artifact: Artifact) => {
                    return this.validateAuthorityLegitimacy(
                        artifact.authority,
                        artifact.type
                    )
                },
            },
            {
                name: 'Evaluation Coherence',
                description:
                    'Validates that evaluation criteria align with purpose',
                weight: 0.85,
                validate: (artifact: Artifact) => {
                    return this.validateEvaluationCoherence(
                        artifact.evaluationCriteria,
                        artifact.purpose
                    )
                },
            },
            {
                name: 'Semantic Metadata Quality',
                description:
                    'Validates semantic metadata completeness and quality',
                weight: 0.7,
                validate: (artifact: Artifact) => {
                    return this.validateSemanticMetadata(artifact)
                },
            },
        ]
    }

    /**
     * Initialize business rules
     */
    private initializeBusinessRules(): void {
        this.businessRules = [
            {
                id: 'strategic_authority',
                name: 'Strategic Artifact Authority',
                description:
                    'Strategic artifacts must have executive-level authority',
                severity: 'warning',
                applies: (artifact: Artifact) => {
                    const strategicTypes: ArtifactType[] = [
                        ARTIFACT_TYPES.VISION,
                        ARTIFACT_TYPES.POLICY,
                        ARTIFACT_TYPES.PRINCIPLE,
                    ]
                    return strategicTypes.includes(artifact.type)
                },
                validate: (artifact: Artifact) => {
                    const executiveTerms = [
                        'executive',
                        'ceo',
                        'board',
                        'leadership',
                        'strategic',
                    ]
                    const hasExecutiveAuthority = executiveTerms.some(term =>
                        artifact.authority.toLowerCase().includes(term)
                    )

                    if (!hasExecutiveAuthority) {
                        return {
                            isValid: false,
                            errors: [],
                            warnings: [
                                {
                                    field: 'authority',
                                    message:
                                        'Strategic artifacts typically require executive-level authority',
                                    suggestion:
                                        'Consider executive leadership or board-level authority',
                                },
                            ],
                            suggestions: [],
                            semanticScore: 0.5,
                        }
                    }

                    return {
                        isValid: true,
                        errors: [],
                        warnings: [],
                        suggestions: [],
                        semanticScore: 1.0,
                    }
                },
            },
            {
                id: 'operational_specificity',
                name: 'Operational Artifact Specificity',
                description:
                    'Operational artifacts must have specific, actionable descriptions',
                severity: 'error',
                applies: (artifact: Artifact) => {
                    const operationalTypes: ArtifactType[] = [
                        ARTIFACT_TYPES.PROCESS,
                        ARTIFACT_TYPES.PROCEDURE,
                        ARTIFACT_TYPES.EVENT,
                    ]
                    return operationalTypes.includes(artifact.type)
                },
                validate: (artifact: Artifact) => {
                    const hasActionWords =
                        /\b(create|update|delete|process|execute|perform|implement)\b/i.test(
                            artifact.description
                        )

                    if (!hasActionWords) {
                        return {
                            isValid: false,
                            errors: [
                                {
                                    field: 'description',
                                    message:
                                        'Operational artifacts must include specific action words',
                                    code: 'OPERATIONAL_NOT_ACTIONABLE',
                                    severity: 'error',
                                },
                            ],
                            warnings: [],
                            suggestions: [
                                {
                                    field: 'description',
                                    suggestion:
                                        'Include action verbs like create, update, process, execute',
                                    reasoning:
                                        'Operational artifacts should clearly describe what actions are taken',
                                    confidence: 0.9,
                                },
                            ],
                            semanticScore: 0.3,
                        }
                    }

                    return {
                        isValid: true,
                        errors: [],
                        warnings: [],
                        suggestions: [],
                        semanticScore: 1.0,
                    }
                },
            },
        ]
    }

    /**
     * Validate artifact schema
     */
    private validateSchema(artifact: Artifact): ValidationResult {
        const result = artifactSchema.safeParse(artifact)

        if (result.success) {
            return {
                isValid: true,
                errors: [],
                warnings: [],
                suggestions: [],
                semanticScore: 1.0,
            }
        }

        const errors: ValidationError[] = result.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: 'SCHEMA_VALIDATION',
            severity: 'error' as const,
        }))

        return {
            isValid: false,
            errors,
            warnings: [],
            suggestions: [],
            semanticScore: 0.0,
        }
    }

    /**
     * Validate partial artifact (for temporal artifacts)
     */
    validatePartialArtifact(
        artifact: Partial<Artifact>
    ): ValidationResult {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        // Required field validation
        if (!artifact.name || artifact.name.trim().length === 0) {
            errors.push({
                field: 'name',
                message: 'Artifact name is required',
                code: 'NAME_REQUIRED',
                severity: 'error',
            })
        }

        if (!artifact.type) {
            errors.push({
                field: 'type',
                message: 'Artifact type is required',
                code: 'TYPE_REQUIRED',
                severity: 'error',
            })
        }

        // Optional field suggestions
        if (!artifact.purpose || artifact.purpose.length < 10) {
            suggestions.push({
                field: 'purpose',
                suggestion:
                    'Add a clear purpose statement to improve semantic clarity',
                reasoning:
                    'Purpose is fundamental to Hexy semantic architecture',
                confidence: 0.9,
            })
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            semanticScore: errors.length === 0 ? 0.7 : 0.3,
        }
    }

    /**
     * Validate semantic metadata quality
     */
    private validateSemanticMetadata(artifact: Artifact): ValidationResult {
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        const metadata = artifact.semanticMetadata

        // Business value validation
        if (metadata.businessValue < 1 || metadata.businessValue > 10) {
            warnings.push({
                field: 'semanticMetadata.businessValue',
                message: 'Business value should be between 1 and 10',
                suggestion: 'Set a realistic business value score',
            })
        }

        // Stakeholder validation
        if (metadata.stakeholders.length === 0) {
            suggestions.push({
                field: 'semanticMetadata.stakeholders',
                suggestion: 'Identify key stakeholders for this artifact',
                reasoning:
                    'Stakeholder identification improves organizational alignment',
                confidence: 0.8,
            })
        }

        // Semantic tags validation
        if (metadata.semanticTags.length === 0) {
            suggestions.push({
                field: 'semanticMetadata.semanticTags',
                suggestion: 'Add semantic tags to improve discoverability',
                reasoning: 'Tags enable better search and categorization',
                confidence: 0.7,
            })
        }

        return {
            isValid: true,
            errors: [],
            warnings,
            suggestions,
            semanticScore: 0.8,
        }
    }

    /**
     * Helper methods for semantic calculations
     */
    private calculatePurposeContextAlignment(
        purpose: string,
        context: Record<string, unknown>
    ): number {
        // Simple heuristic: more context keys and longer purpose = better alignment
        const contextScore = Math.min(Object.keys(context).length / 5, 1)
        const purposeScore = Math.min(purpose.length / 100, 1)
        return (contextScore + purposeScore) / 2
    }

    private calculateAuthorityLegitimacy(
        authority: string,
        artifactType: ArtifactType
    ): number {
        const appropriateAuthorities =
            this.getAppropriateAuthorities(artifactType)
        const isAppropriate = appropriateAuthorities.some(auth =>
            authority.toLowerCase().includes(auth.toLowerCase())
        )
        return isAppropriate ? 0.9 : 0.6
    }

    private calculateEvaluationCoherence(
        criteria: string[]
    ): number {
        if (criteria.length === 0) return 0.0

        const avgCriteriaLength =
            criteria.reduce((sum, c) => sum + c.length, 0) / criteria.length
        const lengthScore = Math.min(avgCriteriaLength / 20, 1)

        const measurableCount = criteria.filter(c =>
            this.isMeasurable(c)
        ).length
        const measurabilityScore = measurableCount / criteria.length

        return (lengthScore + measurabilityScore) / 2
    }

    private calculateRelationshipSemanticScore(
        relationship: Relationship
    ): number {
        let score = 0.5 // Base score

        if (relationship.semanticStrength > 0.7) score += 0.2
        if (relationship.businessImpact === 'high') score += 0.2
        if (relationship.validationStatus === 'valid') score += 0.1

        return Math.min(score, 1.0)
    }

    private getAppropriateAuthorities(artifactType: ArtifactType): string[] {
        const config = ARTIFACT_TYPE_CONFIGS[artifactType]
        if (config?.defaultAuthority) {
            return [config.defaultAuthority]
        }

        // Default authorities by type category
        const strategicTypes: ArtifactType[] = [
            ARTIFACT_TYPES.VISION,
            ARTIFACT_TYPES.POLICY,
            ARTIFACT_TYPES.PRINCIPLE,
        ]
        const operationalTypes: ArtifactType[] = [
            ARTIFACT_TYPES.PROCESS,
            ARTIFACT_TYPES.PROCEDURE,
            ARTIFACT_TYPES.EVENT,
        ]

        if (strategicTypes.includes(artifactType)) {
            return [
                'Executive Leadership',
                'Board of Directors',
                'Strategic Planning',
            ]
        }

        if (operationalTypes.includes(artifactType)) {
            return ['Operations Manager', 'Process Owner', 'Team Lead']
        }

        return ['Department Head', 'Project Manager', 'Subject Matter Expert']
    }

    private isMeasurable(criteria: string): boolean {
        const measurableWords = [
            'measure',
            'metric',
            'count',
            'percentage',
            'time',
            'cost',
            'quality',
            'quantity',
        ]
        return measurableWords.some(word =>
            criteria.toLowerCase().includes(word)
        )
    }

    private validateRelationshipSemanticCoherence(
        relationship: Relationship,
        source: Artifact,
        target: Artifact
    ): ValidationResult {
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        // Type compatibility validation
        const isCompatible = this.areTypesCompatible(
            source.type,
            target.type,
            relationship.type
        )
        if (!isCompatible) {
            warnings.push({
                field: 'relationship.type',
                message: `${relationship.type} relationship may not be semantically appropriate between ${source.type} and ${target.type}`,
                suggestion:
                    'Consider a different relationship type or review artifact types',
            })
        }

        return {
            isValid: true,
            errors: [],
            warnings,
            suggestions,
            semanticScore: isCompatible ? 0.8 : 0.5,
        }
    }

    private calculateCriteriaPurposeAlignment(
        criteria: string[],
        purpose: string
    ): number {
        if (criteria.length === 0) return 0.0

        // Simple heuristic: check if criteria contain words from purpose
        const purposeWords = purpose.toLowerCase().split(/\s+/)
        const alignmentScores = criteria.map(criterion => {
            const criterionWords = criterion.toLowerCase().split(/\s+/)
            const commonWords = purposeWords.filter(word =>
                criterionWords.some(
                    cWord => cWord.includes(word) || word.includes(cWord)
                )
            )
            return (
                commonWords.length /
                Math.max(purposeWords.length, criterionWords.length)
            )
        })

        return (
            alignmentScores.reduce((sum, score) => sum + score, 0) /
            alignmentScores.length
        )
    }

    private areTypesCompatible(
        sourceType: ArtifactType,
        targetType: ArtifactType,
        relationshipType: RelationshipType
    ): boolean {
        // Define semantic compatibility rules
        const compatibilityRules: Partial<
            Record<
                RelationshipType,
                { source: ArtifactType[]; target: ArtifactType[] }
            >
        > = {
            [RELATIONSHIP_TYPES.IMPLEMENTS]: {
                source: [ARTIFACT_TYPES.PROCESS, ARTIFACT_TYPES.PROCEDURE],
                target: [
                    ARTIFACT_TYPES.POLICY,
                    ARTIFACT_TYPES.PRINCIPLE,
                    ARTIFACT_TYPES.GUIDELINE,
                ],
            },
            [RELATIONSHIP_TYPES.SUPPORTS]: {
                source: [
                    ARTIFACT_TYPES.PROCESS,
                    ARTIFACT_TYPES.ACTOR,
                    ARTIFACT_TYPES.AREA,
                ],
                target: [
                    ARTIFACT_TYPES.PURPOSE,
                    ARTIFACT_TYPES.VISION,
                    ARTIFACT_TYPES.POLICY,
                ],
            },
            [RELATIONSHIP_TYPES.DEPENDS_ON]: {
                source: [
                    ARTIFACT_TYPES.PROCESS,
                    ARTIFACT_TYPES.PROCEDURE,
                    ARTIFACT_TYPES.RESULT,
                ],
                target: [
                    ARTIFACT_TYPES.PROCESS,
                    ARTIFACT_TYPES.ACTOR,
                    ARTIFACT_TYPES.AREA,
                ],
            },
            [RELATIONSHIP_TYPES.INFLUENCES]: {
                source: [
                    ARTIFACT_TYPES.POLICY,
                    ARTIFACT_TYPES.PRINCIPLE,
                    ARTIFACT_TYPES.GUIDELINE,
                ],
                target: [
                    ARTIFACT_TYPES.PROCESS,
                    ARTIFACT_TYPES.PROCEDURE,
                    ARTIFACT_TYPES.RESULT,
                ],
            },
        }

        const rule = compatibilityRules[relationshipType]
        if (!rule) return true // Allow if no specific rule

        return (
            rule.source.includes(sourceType) && rule.target.includes(targetType)
        )
    }

    private combineValidationResults(
        results: ValidationResult[]
    ): ValidationResult {
        const allErrors = results.flatMap(r => r.errors)
        const allWarnings = results.flatMap(r => r.warnings)
        const allSuggestions = results.flatMap(r => r.suggestions)

        const avgSemanticScore =
            results.length > 0
                ? results.reduce((sum, r) => sum + r.semanticScore, 0) /
                  results.length
                : 0

        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings,
            suggestions: allSuggestions,
            semanticScore: avgSemanticScore,
        }
    }
}
