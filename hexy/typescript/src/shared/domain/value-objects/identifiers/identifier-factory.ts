import { DocumentNumberValueObject } from './document-number-value-object'
import { IdentifierValueObject } from './identifier-value-object'
import { NumberIdValueObject } from './number-id-value-object'
import { UuidValueObject } from './uuid-value-object'

export class IdentifierFactory {
	static readonly COUNTRY_CODE = 'MX'
	static readonly DOCUMENT_TYPE = 'CURP'

	static create(id: string): IdentifierValueObject {
		if (UuidValueObject.isValid(id)) {
			return new UuidValueObject(id)
		}

		if (NumberIdValueObject.isValid(Number(id))) {
			return new NumberIdValueObject(Number(id))
		}

		return new DocumentNumberValueObject(
			id,
			this.COUNTRY_CODE,
			this.DOCUMENT_TYPE,
		)
	}
}
