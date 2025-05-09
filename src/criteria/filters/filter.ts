import { PrimitiveValueObject } from '@/aggregate'
import type { FilterValuePrimitive } from './filter-value'
import { FilterField } from './filter-field'
import { FilterOperator, FilterOperators } from './filter-operator'
import { FilterValue } from './filter-value'

export type FilterPrimitives = {
	field: string
	operator: FilterOperators
	value: FilterValuePrimitive
}

export class Filter extends PrimitiveValueObject<{
	field: FilterField
	operator: FilterOperator
	value: FilterValue
}> {
	validate(value: {
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
		return new Filter({
			field: new FilterField(primitives.field),
			operator: new FilterOperator(primitives.operator),
			value: new FilterValue(primitives.value),
		})
	}

	toPrimitives(): FilterPrimitives {
		return {
			field: this.value.field.toString(),
			operator: this.value.operator.toPrimitive(),
			value: this.value.value.toPrimitive(),
		}
	}
}
