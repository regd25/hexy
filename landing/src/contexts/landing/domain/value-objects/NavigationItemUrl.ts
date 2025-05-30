import { ValueObject } from '@/src/shared/domain/ValueObject'

export class NavigationItemUrl extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    this.ensureIsValid(value)
  }

  private ensureIsValid(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('NavigationItemUrl cannot be empty')
    }
    
    // Allow relative URLs (starting with / or #), absolute URLs, or hash fragments
    const urlPattern = /^(\/[^\s]*|https?:\/\/[^\s]+|#[^\s]*)$/
    if (!urlPattern.test(value)) {
      throw new Error('NavigationItemUrl must be a valid relative URL, absolute URL, or hash fragment')
    }
  }

  static create(value: string): NavigationItemUrl {
    return new NavigationItemUrl(value.trim())
  }

  isExternal(): boolean {
    return this.value.startsWith('http')
  }
} 