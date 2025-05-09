import { DomainError } from '@hexy/error'
import type { PrimitiveValueObject } from '../..'

export class InvalidMonetary extends DomainError {
	constructor(valueObject: PrimitiveValueObject<number>) {
		super(`Invalid monetary value: ${valueObject.value}`)
	}
}
