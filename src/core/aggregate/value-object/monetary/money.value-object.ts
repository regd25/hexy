import { ValueObject } from '../value-object'
import { Currency } from './currency.value-object'
import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { Amount } from './amount.value-object'

type MoneyPrimitives = {
	amount: number
	currency: string
}

export class Money extends ValueObject<MoneyPrimitives> {
	private readonly amount: Amount
	private readonly currency: Currency

	constructor(value: MoneyPrimitives) {
		super(value)
		this.amount = new Amount(value.amount)
		this.currency = new Currency(
			value.currency as keyof typeof Currency.Currency,
		)
		if (!this.validate(value)) {
			throw new InvalidValueObject(`Invalid value for money value object`)
		}
	}

	protected validate(value: MoneyPrimitives): boolean {
		return (
			this.amount instanceof Amount &&
			this.currency instanceof Currency &&
			value.amount >= 0
		)
	}

	add(other: Money): Money {
		this.validateSameCurrency(other)
		return new Money({
			amount: this.amount.toPrimitive() + other.amount.toPrimitive(),
			currency: this.currency.toPrimitive(),
		})
	}

	subtract(other: Money): Money {
		this.validateSameCurrency(other)
		return new Money({
			amount: this.amount.toPrimitive() - other.amount.toPrimitive(),
			currency: this.currency.toPrimitive(),
		})
	}

	private validateSameCurrency(other: Money): void {
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

	equals(other: Money): boolean {
		return (
			this.amount.equals(other.amount) && this.currency.equals(other.currency)
		)
	}
}
