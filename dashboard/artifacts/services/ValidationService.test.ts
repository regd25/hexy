import { describe, it, expect } from 'vitest'
import { ValidationService } from './ValidationService'

describe('ValidationService', () => {
    it('should return errors for missing required fields in partial artifact', () => {
        const service = new ValidationService()
        const result = service.validatePartialArtifact({})

        const fields = result.errors.map(e => e.field).sort()
        expect(fields).toContain('name')
        expect(fields).toContain('type')
        expect(result.isValid).toBe(false)
    })

    it('should suggest adding purpose when too short or missing', () => {
        const service = new ValidationService()
        const result = service.validatePartialArtifact({ name: 'A', type: 'PROCESS' as any })

        const suggestionFields = result.suggestions.map(s => s.field)
        expect(suggestionFields).toContain('purpose')
    })
})
