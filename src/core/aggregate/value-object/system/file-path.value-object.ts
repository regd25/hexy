import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { ValueObject } from '../value-object'

/**
 * @description A value object that represents a file path.
 * @example
 * const filepath = new FilepathValueObject('/path/to/file.txt')
 */
export class FilePath extends ValueObject<string> {
	private static readonly PATH_REGEX =
		/^(?:[a-zA-Z]\:(\\|\/)|\.?\.?\/(\\|\/))?([\w\-\.\s]+(\\|\/))+\w([\w\-\.\s]+)*$/

	/**
	 * @description Creates a new FilepathValueObject instance.
	 * @param value - The file path to wrap.
	 */
	constructor(value: string) {
		super(value.replace(/\\/g, '/').trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObject('Invalid file path format')
		}
	}

	protected validate(value: string): boolean {
		return FilePath.PATH_REGEX.test(value)
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
