import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class FilepathValueObject extends StringValueObject {
	private static readonly PATH_REGEX =
		/^(?:[a-zA-Z]\:(\\|\/)|\.?\.?\/(\\|\/))?([\w\-\.\s]+(\\|\/))+\w([\w\-\.\s]+)*$/

	constructor(value: string) {
		super(value.replace(/\\/g, '/').trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObjectError('Invalid file path format')
		}
	}

	protected validate(value: string): boolean {
		return FilepathValueObject.PATH_REGEX.test(value)
	}

	get filename(): string {
		return this.value.split('/').pop() || ''
	}

	get extension(): string {
		return this.filename.split('.').pop() || ''
	}

	get parentDirectory(): string {
		return this.value.split('/').slice(0, -1).join('/')
	}

	isAbsolute(): boolean {
		return this.value.startsWith('/') || /^[a-zA-Z]:\//.test(this.value)
	}
}
