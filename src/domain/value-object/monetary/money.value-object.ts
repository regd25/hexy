import { ValueObject } from '../value-object'
import { Currency } from './currency.value-object'
import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { Amount } from './amount.value-object'

type MoneyPrimitives = {
	amount: number
	currency: string
}

/**
 * @description A value object that represents a monetary amount.
 * @example
 * const money = new Money({ amount: 100, currency: 'USD' })
 */
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
			throw new InvalidValueObject(Money, value)
		}
	}

	protected validate(value: MoneyPrimitives): boolean {
		return (
			this.amount instanceof Amount &&
			this.currency instanceof Currency &&
			value.amount >= 0
		)
	}

	/**
	 * @description Adds two Money instances.
	 * @param other - The other Money instance.
	 * @returns A new Money instance with the sum of the amounts.
	 */
	add(other: Money): Money {
		this.validateSameCurrency(other)
		return new Money({
			amount: this.amount.toPrimitive() + other.amount.toPrimitive(),
			currency: this.currency.toPrimitive(),
		})
	}

	/**
	 * @description Subtracts two Money instances.
	 * @param other - The other Money instance.
	 * @returns A new Money instance with the difference of the amounts.
	 */
	subtract(other: Money): Money {
		this.validateSameCurrency(other)
		return new Money({
			amount: this.amount.toPrimitive() - other.amount.toPrimitive(),
			currency: this.currency.toPrimitive(),
		})
	}

	/**
	 * @description Validates that the currencies are the same.
	 * @param other - The other Money instance.
	 */
	private validateSameCurrency(other: Money): void {
		if (!this.currency.equals(other.currency)) {
			throw new Error('Currency mismatch in monetary operation')
		}
	}

	/**
	 * @description Formats the amount in the specified locale.
	 * @param locale - The locale to format the amount in.
	 * @returns The formatted amount.
	 */
	toFormattedString(locale = 'en-US'): string {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: this.currency.toPrimitive(),
		}).format(this.amount.toPrimitive())
	}

	/**
	 * @description Checks if two Money instances are equal.
	 * @param other - The other Money instance.
	 * @returns True if the Money instances are equal, false otherwise.
	 */
	equals(other: Money): boolean {
		return (
			this.amount.equals(other.amount) && this.currency.equals(other.currency)
		)
	}
}
