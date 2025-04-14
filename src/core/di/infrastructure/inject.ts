/**
 * Decorator that specifies a custom token for dependency injection.
 * Used when you need to inject a dependency using a token different from the class constructor parameter.
 *
 * @param token - The token to use for injection. If not provided, it will try to infer from the parameter type.
 *
 * @example
 * @Injectable()
 * export class MyService {
 *   constructor(@Inject(CONFIG_TOKEN) private config: Config) {}
 * }
 *
 * @Injectable()
 * export class MyService {
 *   constructor(@Inject() private otherService: OtherService) {}
 * }
 */
export function Inject(token?: any): ParameterDecorator {
	return (
		target: Object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		// If no token provided, we'll mark this parameter for type inference
		// The container will try to resolve based on the parameter type
		const useInference = token === undefined

		// Store the token information
		const existingTokens = Reflect.getMetadata('inject:tokens', target) || []
		existingTokens[parameterIndex] = token
		Reflect.defineMetadata('inject:tokens', existingTokens, target)

		// Store information about type inference
		const inferenceFlags = Reflect.getMetadata('inject:inference', target) || []
		inferenceFlags[parameterIndex] = useInference
		Reflect.defineMetadata('inject:inference', inferenceFlags, target)
	}
}
