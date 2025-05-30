export abstract class ValueObject<T> {
  protected readonly _value: T

  constructor(value: T) {
    this._value = value
  }

  get value(): T {
    return this._value
  }

  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false
    }
    
    if (this.constructor !== other.constructor) {
      return false
    }
    
    return this._value === other._value
  }

  toString(): string {
    return String(this._value)
  }
} 