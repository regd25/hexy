import {
	DocumentNumber,
	type CountryCode,
} from './document-number.value-object'
import { type Identifier } from './identifier.value-object'
import { NumberId } from './number-id.value-object'
import { Uuid } from './uuid.value-object'

type DocumentType = keyof (typeof DocumentNumber.PATTERNS)['MX']

/**
 * @description A factory for creating identifiers.
 * @example
 * const identifier = IdentifierFactory.create('123e4567-e89b-12d3-a456-426614174000')
 */
export class IdentifierFactory {
	static readonly COUNTRY_CODE = 'MX'
	static readonly DOCUMENT_TYPE = 'CURP'

	/**
	 * @description Creates an identifier.
	 * @param id - The identifier.
	 * @param countryCode - The country code.
	 * @param documentType - The document type.
	 */
	static create(
		id: string,
		countryCode: CountryCode = IdentifierFactory.COUNTRY_CODE,
		documentType: DocumentType = IdentifierFactory.DOCUMENT_TYPE,
	): Identifier {
		if (Uuid.isValid(id)) {
			return new Uuid(id)
		}

		if (NumberId.isValid(Number(id))) {
			return new NumberId(Number(id))
		}

		return new DocumentNumber(id, countryCode, documentType)
	}
}
