import { StringValueObject, InvalidValueObjectError } from '../../value-objects'

/**
 * Represents a filter field that can be used to filter a value.
 */
export class FilterField extends StringValueObject {
	private static readonly ALLOWED_FIELDS = ['id', 'createdAt', 'updatedAt']

	constructor(value: string) {
		super(value)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError('Invalid filter field')
		}
	}

	protected validate(value: string): boolean {
		return super.validate(value) && FilterField.ALLOWED_FIELDS.includes(value)
	}
}
