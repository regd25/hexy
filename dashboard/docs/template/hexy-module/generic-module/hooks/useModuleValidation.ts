import { useCallback, useMemo } from 'react'
import { ModuleData, ValidationResult, ValidationRule } from '../types/Module'

export interface UseModuleValidationReturn {
  validate: (data: ModuleData) => ValidationResult
  validateField: (fieldName: string, value: any) => string[]
  isValid: (data: ModuleData) => boolean
  getValidationErrors: (data: ModuleData) => Record<string, string[]>
}

const defaultValidationRules: ValidationRule[] = [
  {
    field: 'name',
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters'
  },
  {
    field: 'description',
    required: false,
    maxLength: 500,
    message: 'Description must not exceed 500 characters'
  }
]

export const useModuleValidation = (
  customRules: ValidationRule[] = []
): UseModuleValidationReturn => {
  const validationRules = useMemo(() => [
    ...defaultValidationRules,
    ...customRules
  ], [customRules])

  const validateField = useCallback((fieldName: string, value: any): string[] => {
    const errors: string[] = []
    const rules = validationRules.filter(rule => rule.field === fieldName)

    for (const rule of rules) {
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors.push(`${fieldName} is required`)
        continue
      }

      if (value && typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${fieldName} must be at least ${rule.minLength} characters`)
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${fieldName} must not exceed ${rule.maxLength} characters`)
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(rule.message || `${fieldName} format is invalid`)
        }
      }

      if (rule.custom) {
        const customError = rule.custom(value)
        if (customError) {
          errors.push(customError)
        }
      }
    }

    return errors
  }, [validationRules])

  const getValidationErrors = useCallback((data: ModuleData): Record<string, string[]> => {
    const errors: Record<string, string[]> = {}
    
    for (const rule of validationRules) {
      const fieldErrors = validateField(rule.field, (data as any)[rule.field])
      if (fieldErrors.length > 0) {
        errors[rule.field] = fieldErrors
      }
    }
    
    return errors
  }, [validationRules, validateField])

  const validate = useCallback((data: ModuleData): ValidationResult => {
    const errors = getValidationErrors(data)
    const isValid = Object.keys(errors).length === 0
    
    return {
      isValid,
      errors,
      warnings: [] // Can be extended for warnings
    }
  }, [getValidationErrors])

  const isValid = useCallback((data: ModuleData): boolean => {
    return validate(data).isValid
  }, [validate])

  return {
    validate,
    validateField,
    isValid,
    getValidationErrors
  } 
}