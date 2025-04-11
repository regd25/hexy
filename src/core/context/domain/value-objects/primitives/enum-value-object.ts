import { ValueObject } from '../value-object'

/**
 * Base class for enum-based value objects
 * @template TEnum - Enum type to validate against
 */
export abstract class EnumValueObject<
	TEnum extends { [key: string]: string },
> extends ValueObject<string> {
	constructor(
		value: string,
		private readonly enumType: TEnum,
	) {
		super(value)
	}

	protected validate(value: string): boolean {
		return Object.values(this.enumType).includes(value)
	}

	/**
	 * Gets the enum key for the value
	 */
	get enumKey(): keyof TEnum {
		return this.enumType[this.value] as keyof TEnum
	}
}
