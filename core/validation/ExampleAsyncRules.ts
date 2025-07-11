/**
 * Example Async Validation Rules - Demonstrates proper async handling
 * Shows how to implement ValidationRule with async operations
 */

import { SOLArtifact } from '../artifacts/SOLArtifact'
import { ValidationRule, ValidationRuleResult, ValidationContext } from '../types/ValidationResult'

/**
 * ✅ EJEMPLO: Regla asíncrona para validar existencia de referencias
 */
export const asyncReferenceExistenceRule: ValidationRule = {
  id: 'async-reference-existence',
  name: 'Async reference existence validation',
  description: 'Validates that all referenced artifacts exist using async repository queries',
  category: 'reference-integrity',
  severity: 'critical',
  applicableArtifacts: ['*'],
  requiresRepository: true,  // ✅ Indica que necesita acceso al repositorio
  cacheable: true,           // ✅ Indica que el resultado es cacheable

  // ✅ Implementación asíncrona correcta
  validate: async (artifact: SOLArtifact, context: ValidationContext): Promise<ValidationRuleResult> => {
    const errors = []
    const warnings = []
    const suggestions = []

    if (!context?.repository) {
      return {
        passed: false,
        errors: [{
          code: 'MISSING_REPOSITORY',
          message: 'Repository context required for async validation',
          severity: 'critical',
          rule: 'async-reference-existence'
        }],
        warnings: [],
        suggestions: []
      }
    }

    // Recopilar todas las referencias del artefacto
    const referencesToCheck: string[] = []
    
    if (artifact.uses) {
      Object.values(artifact.uses).forEach(ref => {
        if (ref) referencesToCheck.push(ref)
      })
    }

    if (artifact.relationships?.dependsOn) {
      referencesToCheck.push(...artifact.relationships.dependsOn)
    }

    // ✅ Verificar existencia usando caché primero
    for (const reference of referencesToCheck) {
      // Check cache first
      if (context.referenceCache?.has(reference)) {
        const exists = context.referenceCache.get(reference)!
        if (!exists) {
          errors.push({
            code: 'BROKEN_REFERENCE_CACHED',
            message: `Referenced artifact not found (cached): ${reference}`,
            severity: 'critical',
            rule: 'async-reference-existence'
          })
        }
        continue
      }

      // ✅ Query repository if not in cache
      try {
        const referencedArtifact = await context.repository.findByReference(reference)
        const exists = referencedArtifact !== null

        // Update cache
        if (context.referenceCache) {
          context.referenceCache.set(reference, exists)
        }

        if (!exists) {
          errors.push({
            code: 'BROKEN_REFERENCE',
            message: `Referenced artifact not found: ${reference}`,
            severity: 'critical',
            rule: 'async-reference-existence'
          })
        }
      } catch (error) {
        errors.push({
          code: 'REFERENCE_VALIDATION_ERROR',
          message: `Error validating reference ${reference}: ${error}`,
          severity: 'high',
          rule: 'async-reference-existence'
        })
      }
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }
}

/**
 * ✅ EJEMPLO: Regla asíncrona para validar autoridad activa
 */
export const asyncAuthorityValidationRule: ValidationRule = {
  id: 'async-authority-validation',
  name: 'Async authority validation',
  description: 'Validates that referenced authorities are active and have proper permissions',
  category: 'authority-consistency',
  severity: 'high',
  applicableArtifacts: ['*'],
  requiresRepository: true,
  cacheable: true,

  validate: async (artifact: SOLArtifact, context: ValidationContext): Promise<ValidationRuleResult> => {
    const errors = []
    const warnings = []
    const suggestions = []

    if (!artifact.uses?.authority || !context?.repository) {
      return { passed: true, errors: [], warnings: [], suggestions: [] }
    }

    const authorityRef = artifact.uses.authority

    try {
      // ✅ Consulta asíncrona con manejo de errores
      const authorityArtifact = await context.repository.findByReference(authorityRef)
      
      if (!authorityArtifact) {
        errors.push({
          code: 'AUTHORITY_NOT_FOUND',
          message: `Authority artifact not found: ${authorityRef}`,
          severity: 'critical',
          rule: 'async-authority-validation'
        })
        return { passed: false, errors, warnings, suggestions }
      }

      // Validar que la autoridad esté activa
      if (authorityArtifact.content.isActive === false) {
        errors.push({
          code: 'INACTIVE_AUTHORITY',
          message: `Referenced authority is inactive: ${authorityRef}`,
          severity: 'high',
          rule: 'async-authority-validation'
        })
      }

      // Validar expiración
      if (authorityArtifact.content.validUntil) {
        const expirationDate = new Date(authorityArtifact.content.validUntil)
        if (expirationDate < new Date()) {
          errors.push({
            code: 'EXPIRED_AUTHORITY',
            message: `Referenced authority has expired: ${authorityRef}`,
            severity: 'high',
            rule: 'async-authority-validation'
          })
        }
      }

      // Sugerir renovación si está próximo a expirar
      if (authorityArtifact.content.validUntil) {
        const expirationDate = new Date(authorityArtifact.content.validUntil)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
        
        if (expirationDate < thirtyDaysFromNow) {
          warnings.push({
            code: 'AUTHORITY_EXPIRING_SOON',
            message: `Authority expires soon: ${authorityRef}`,
            rule: 'async-authority-validation',
            suggestion: 'Consider renewing authority before expiration',
            impact: 'compliance'
          })
        }
      }

    } catch (error) {
      errors.push({
        code: 'AUTHORITY_VALIDATION_ERROR',
        message: `Error validating authority ${authorityRef}: ${error}`,
        severity: 'medium',
        rule: 'async-authority-validation'
      })
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }
}

/**
 * ✅ EJEMPLO: Regla asíncrona para validar coherencia de contexto
 */
export const asyncContextCoherenceRule: ValidationRule = {
  id: 'async-context-coherence',
  name: 'Async context coherence validation',
  description: 'Validates that artifact context is coherent with organizational structure',
  category: 'hierarchical-compliance',
  severity: 'medium',
  applicableArtifacts: ['*'],
  requiresRepository: true,
  cacheable: true,

  validate: async (artifact: SOLArtifact, context: ValidationContext): Promise<ValidationRuleResult> => {
    const errors = []
    const warnings = []
    const suggestions = []

    if (!artifact.uses?.context || !artifact.organizational?.area || !context?.repository) {
      return { passed: true, errors: [], warnings: [], suggestions: [] }
    }

    try {
      // ✅ Consultas paralelas para optimizar rendimiento
      const [contextArtifact, areaArtifact] = await Promise.all([
        context.repository.findByReference(artifact.uses.context),
        context.repository.findByReference(artifact.organizational.area)
      ])

      if (!contextArtifact) {
        errors.push({
          code: 'CONTEXT_NOT_FOUND',
          message: `Context artifact not found: ${artifact.uses.context}`,
          severity: 'critical',
          rule: 'async-context-coherence'
        })
      }

      if (!areaArtifact) {
        errors.push({
          code: 'AREA_NOT_FOUND',
          message: `Area artifact not found: ${artifact.organizational.area}`,
          severity: 'critical',
          rule: 'async-context-coherence'
        })
      }

      // Si ambos existen, validar coherencia
      if (contextArtifact && areaArtifact) {
        // Verificar que el scope del contexto incluya el área
        const contextScope = contextArtifact.content.scope || ''
        const areaName = areaArtifact.content.name || ''

        if (!contextScope.includes(areaName) && !contextScope.includes('*')) {
          warnings.push({
            code: 'CONTEXT_AREA_MISMATCH',
            message: `Context scope "${contextScope}" may not include area "${areaName}"`,
            rule: 'async-context-coherence',
            suggestion: 'Verify that the context scope is appropriate for the organizational area',
            impact: 'maintainability'
          })
        }

        // Verificar niveles organizacionales compatibles
        const contextLevel = contextArtifact.organizational?.level
        const artifactLevel = artifact.organizational?.level

        if (contextLevel && artifactLevel && contextLevel !== artifactLevel) {
          suggestions.push({
            code: 'SUGGEST_LEVEL_ALIGNMENT',
            message: `Context level "${contextLevel}" differs from artifact level "${artifactLevel}"`,
            location: { artifact: artifact.metadata.id, section: 'organizational.level' },
            improvement: `Consider aligning levels or using a ${artifactLevel}-level context`,
            benefit: 'Improved organizational coherence',
            effort: 'medium'
          })
        }
      }

    } catch (error) {
      errors.push({
        code: 'CONTEXT_COHERENCE_ERROR',
        message: `Error validating context coherence: ${error}`,
        severity: 'medium',
        rule: 'async-context-coherence'
      })
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }
}

/**
 * ✅ EJEMPLO: Factory para crear reglas asíncronas
 */
export class AsyncValidationRuleFactory {
  static createAsyncReferenceRule(): ValidationRule {
    return asyncReferenceExistenceRule
  }

  static createAsyncAuthorityRule(): ValidationRule {
    return asyncAuthorityValidationRule
  }

  static createAsyncContextRule(): ValidationRule {
    return asyncContextCoherenceRule
  }

  static getAllAsyncRules(): ValidationRule[] {
    return [
      asyncReferenceExistenceRule,
      asyncAuthorityValidationRule,
      asyncContextCoherenceRule
    ]
  }
} 