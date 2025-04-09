import { ValueObject, InvalidValueObjectError } from '../../aggregate/value-objects'
import { FilterField } from './filter-field'
import { FilterOperator, FilterOperators } from './filter-operator'
import { FilterValue, FilterValuePrimitive } from './filter-value'

export type FilterPrimitives = {
	field: string
	operator: string
	value: FilterValuePrimitive
}

export class Filter extends ValueObject<{
	field: FilterField
	operator: FilterOperator
	value: FilterValue
}> {
	constructor(
		field: FilterField,
		operator: FilterOperator,
		value: FilterValue,
	) {
		super({ field, operator, value })
		if (!this.validate({ field, operator, value })) {
			throw new InvalidValueObjectError('Invalid filter')
		}
	}

	protected validate(value: {
		field: FilterField
		operator: FilterOperator
		value: FilterValue
	}): boolean {
		return (
			value.field instanceof FilterField &&
			value.operator instanceof FilterOperator &&
			value.value instanceof FilterValue
		)
	}

	static fromPrimitives(primitives: FilterPrimitives): Filter {
		return new Filter(
			new FilterField(primitives.field),
			new FilterOperator(primitives.operator as FilterOperators),
			new FilterValue(primitives.value),
		)
	}

	toPrimitives(): FilterPrimitives {
		return {
			field: this.value.field.toString(),
			operator: this.value.operator.toString(),
			value: this.value.value.toPrimitive(),
		}
	}
}
