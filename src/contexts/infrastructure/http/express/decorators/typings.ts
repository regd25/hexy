/**
 * Custom parameter decorator definition that works around TypeScript limitations.
 * ParameterDecorator en TypeScript tiene una definición muy estricta que no permite
 * que propertyKey sea undefined, por lo que necesitamos nuestra propia definición.
 */
export type CustomParameterDecorator = (
  target: Object,
  propertyKey: string | symbol,
  parameterIndex: number
) => void; 