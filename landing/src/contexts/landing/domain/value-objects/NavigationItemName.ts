import { ValueObject } from '@/src/shared/domain/ValueObject'

export class NavigationItemName extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    this.ensureIsValid(value)
  }

  private ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('NavigationItemName cannot be empty')
    }
    
    if (value.length > 100) {
      throw new Error('NavigationItemName cannot exceed 100 characters')
    }
  }

  static create(value: string): NavigationItemName {
    return new NavigationItemName(value.trim())
  }
} 