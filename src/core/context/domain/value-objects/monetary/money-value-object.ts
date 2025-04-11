import { ValueObject } from '../value-object'
import { CurrencyValueObject } from './currency-value-object'
import { InvalidValueObjectError } from '../errors/invalid-value-object-error'
import { AmountValueObject } from './amount-value-object'

type MoneyPrimitives = {
	amount: number
	currency: string
}

export class MoneyValueObject extends ValueObject<MoneyPrimitives> {
	private readonly amount: AmountValueObject
	private readonly currency: CurrencyValueObject

	constructor(value: MoneyPrimitives) {
		super(value)
		this.amount = new AmountValueObject(value.amount)
		this.currency = new CurrencyValueObject(value.currency)
		if (!this.validate(value)) {
			throw new InvalidValueObjectError(`Invalid value for money value object`)
		}
	}

	protected validate(value: MoneyPrimitives): boolean {
		return (
			this.amount instanceof AmountValueObject &&
			this.currency instanceof CurrencyValueObject &&
			value.amount >= 0
		)
	}

	add(other: MoneyValueObject): MoneyValueObject {
		this.validateSameCurrency(other)
		return new MoneyValueObject({
			amount: this.amount.toPrimitive() + other.amount.toPrimitive(),
			currency: this.currency.toPrimitive(),
		})
	}

	subtract(other: MoneyValueObject): MoneyValueObject {
		this.validateSameCurrency(other)
		return new MoneyValueObject({
			amount: this.amount.toPrimitive() - other.amount.toPrimitive(),
			currency: this.currency.toPrimitive(),
		})
	}

	private validateSameCurrency(other: MoneyValueObject): void {
		if (!this.currency.equals(other.currency)) {
			throw new Error('Currency mismatch in monetary operation')
		}
	}

	toFormattedString(locale = 'en-US'): string {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: this.currency.toPrimitive(),
		}).format(this.amount.toPrimitive())
	}

	equals(other: MoneyValueObject): boolean {
		return (
			this.amount.equals(other.amount) && this.currency.equals(other.currency)
		)
	}
}
