import { DocumentNumber } from './document-number.value-object'
import { NumberId } from './number-id.value-object'
import { Uuid } from './uuid.value-object'

export type Identifier = Uuid | NumberId | DocumentNumber
