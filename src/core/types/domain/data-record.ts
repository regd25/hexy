import { type Complex } from './complex'
import { type Primitive } from './primitive'

export type DataRecord = Record<string, Primitive | Complex>

export type PrimitiveDataRecord = Record<string, Primitive>

export type ComplexDataRecord = Record<string, Complex>

export type DataRecordArray = DataRecord[]

export type PrimitiveDataRecordArray = PrimitiveDataRecord[]

export type ComplexDataRecordArray = ComplexDataRecord[]
