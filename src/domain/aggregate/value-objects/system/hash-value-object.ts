import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class HashValueObject extends StringValueObject {
	private static readonly HASH_REGEX = /^[a-fA-F0-9]{32,128}$/

	constructor(value: string) {
		super(value.toLowerCase().trim())
		if (!this.validate(this.value)) {
			throw new InvalidValueObjectError('Invalid hash format')
		}
	}

	protected validate(value: string): boolean {
		return HashValueObject.HASH_REGEX.test(value)
	}

	get algorithm(): string {
		const length = this.value.length
		return length === 32
			? 'md5'
			: length === 40
				? 'sha1'
				: length === 64
					? 'sha256'
					: 'unknown'
	}

	compareWith(hash: HashValueObject): boolean {
		return this.value === hash.toPrimitive()
	}
}
