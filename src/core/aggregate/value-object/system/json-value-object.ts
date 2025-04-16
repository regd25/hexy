import { StringValueObject } from '../primitives/string-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'

export class JsonValueObject extends StringValueObject {
	private parsedValue: unknown

	constructor(value: string | object) {
		const stringValue =
			typeof value === 'string' ? value : JSON.stringify(value)
		super(stringValue)

		try {
			this.parsedValue = JSON.parse(stringValue)
		} catch {
			throw new InvalidValueObjectError('Invalid JSON format')
		}
	}

	protected validate(value: string): boolean {
		try {
			JSON.parse(value)
			return true
		} catch {
			return false
		}
	}

	get parsed(): unknown {
		return this.parsedValue
	}

	get type(): string {
		return Array.isArray(this.parsedValue)
			? 'array'
			: typeof this.parsedValue === 'object' && this.parsedValue !== null
				? 'object'
				: typeof this.parsedValue
	}

	getProperty<T>(path: string): T | undefined {
		return path
			.split('.')
			.reduce(
				(acc, key) =>
					acc && typeof acc === 'object'
						? acc[key as keyof typeof acc]
						: undefined,
				this.parsedValue,
			) as T
	}
}
