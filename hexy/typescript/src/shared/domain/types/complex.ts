import { Primitive } from './primitive'
type ComplexValue = {
	[key: string]: Primitive
}
export type Complex = ComplexValue | ComplexValue[] | Primitive[]
