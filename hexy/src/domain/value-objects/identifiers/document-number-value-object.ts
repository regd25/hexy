import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

type CountryCode = 'MX' | 'ES' | 'US'
type DocumentType = keyof (typeof DocumentNumberValueObject.PATTERNS)['MX']

export class DocumentNumberValueObject extends StringValueObject {
	static readonly PATTERNS = {
		MX: {
			RFC: /^[A-Z]{3}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z0-9]{3}$/,
			CURP: /^[A-Z][AEIOU][A-Z]{2}[0-9]{2}[0-1][0-9][0-3][0-9][HM][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z][0-9]$/,
			DNI: /^[0-9]{8}$/,
			INE: /^[0-9]{10}$/,
			IMSS: /^[0-9]{11}$/,
			NIE: /^[0-9]{10}$/,
			PASSPORT: /^[0-9]{9}$/,
		},
		ES: {
			DNI: /^[0-9]{8}[A-Z]$/,
			NIE: /^[XYZ][0-9]{7}[A-Z]$/,
			PASSPORT: /^[A-Z]{2}[0-9]{6}$/,
		},
		US: {
			SSN: /^\d{3}-\d{2}-\d{4}$/,
			DNI: /^\d{9}$/,
			NIE: /^[XYZ][0-9]{7}[A-Z]$/,
			PASSPORT: /^[A-Z]{2}[0-9]{6}$/,
		},
	} as const

	constructor(
		value: string,
		readonly country: CountryCode,
		readonly docType: DocumentType,
	) {
		super(value.replace(/[\s-]/g, '').toUpperCase())
		if (!this.validate(this.value)) {
			throw new InvalidValueObjectError('Invalid document number format')
		}
	}

	protected validate(value: string): boolean {
		const pattern = DocumentNumberValueObject.PATTERNS[this.country] as Record<
			DocumentType,
			RegExp
		>
		return !!pattern[this.docType]?.test(value)
	}

	get formatted(): string {
		const formatMap = {
			MX: {
				RFC: (v: string) => v,
				CURP: (v: string) => v,
				DNI: (v: string) =>
					v.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4'),
			},
			US: {
				SSN: (v: string) => v.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3'),
			},
			ES: {
				DNI: (v: string) =>
					v.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4'),
			},
		}

		return (
			(
				formatMap[this.country] as Record<DocumentType, (v: string) => string>
			)?.[this.docType]?.(this.value) || this.value
		)
	}
}
