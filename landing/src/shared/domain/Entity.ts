import { ValueObject } from './ValueObject'

export abstract class Entity<T extends ValueObject<any>> {
  protected readonly _id: T

  constructor(id: T) {
    this._id = id
  }

  get id(): T {
    return this._id
  }

  equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false
    }
    
    if (this.constructor !== other.constructor) {
      return false
    }
    
    return this._id.equals(other._id)
  }
} 