import { ValueObject } from '@/src/shared/domain/ValueObject'

export class NavigationItemId extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    this.ensureIsValid(value)
  }

  private ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('NavigationItemId cannot be empty')
    }
    
    if (value.length > 50) {
      throw new Error('NavigationItemId cannot exceed 50 characters')
    }
    
    if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
      throw new Error('NavigationItemId must contain only alphanumeric characters, hyphens, and underscores')
    }
  }

  static create(value: string): NavigationItemId {
    return new NavigationItemId(value)
  }
} 