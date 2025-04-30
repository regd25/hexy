import { DocumentNumber } from './document-number.value-object'
import { type Identifier } from './identifier.value-object'
import { NumberId } from './number-id.value-object'
import { Uuid } from './uuid.value-object'

export class IdentifierFactory {
	static readonly COUNTRY_CODE = 'MX'
	static readonly DOCUMENT_TYPE = 'CURP'

	static create(id: string): Identifier {
		if (Uuid.isValid(id)) {
			return new Uuid(id)
		}

		if (NumberId.isValid(Number(id))) {
			return new NumberId(Number(id))
		}

		return new DocumentNumber(
			id,
			this.COUNTRY_CODE,
			this.DOCUMENT_TYPE,
		)
	}
}
