import { DocumentNumberValueObject } from './document-number-value-object'
import { NumberIdValueObject } from './number-id-value-object'
import { UuidValueObject } from './uuid-value-object'

export type IdentifierValueObject =
	| UuidValueObject
	| NumberIdValueObject
	| DocumentNumberValueObject
