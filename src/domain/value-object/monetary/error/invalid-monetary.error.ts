import { DomainError } from '@hexy/error'
import type { ValueObject } from '../..'

export class InvalidMonetary extends DomainError {
	constructor(valueObject: ValueObject<number>) {
		super(`Invalid monetary value: ${valueObject.value}`)
	}
}
