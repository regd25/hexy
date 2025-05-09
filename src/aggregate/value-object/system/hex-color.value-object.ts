import { InvalidValueObject } from '../errors/invalid-value-object.error'
import { PrimitiveValueObject } from '../primitive-value-object'

export class HexColor extends PrimitiveValueObject<string> {
	private static readonly HEX_COLOR_REGEX =
		/^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/

	constructor(value: string) {
		super(value.startsWith('#') ? value : `#${value}`)
		if (!this.validate(this.value)) {
			throw new InvalidValueObject('Invalid hex color format')
		}
	}

	protected validate(value: string): boolean {
		return HexColor.HEX_COLOR_REGEX.test(value)
	}

	get rgb(): [number, number, number] {
		const hex = this.value.replace('#', '')
		const expanded =
			hex.length === 3
				? hex
						.split('')
						.map((c) => c + c)
						.join('')
				: hex

		return [
			parseInt(expanded.substring(0, 2), 16),
			parseInt(expanded.substring(2, 4), 16),
			parseInt(expanded.substring(4, 6), 16),
		]
	}

	get alpha(): number {
		return this.value.length === 9
			? parseInt(this.value.substring(7, 9), 16) / 255
			: 1
	}
}
