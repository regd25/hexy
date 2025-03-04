/**
 * Decorator that specifies a custom token for dependency injection.
 * Used when you need to inject a dependency using a token different from the class constructor parameter.
 *
 * @example
 * @Injectable()
 * export class MyService {
 *   constructor(@Inject('CONFIG') private config: Config) {}
 * }
 */
export function Inject(token: any): ParameterDecorator {
	return (
		target: Object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		const existingTokens = Reflect.getMetadata('inject:tokens', target) || []
		existingTokens[parameterIndex] = token
		Reflect.defineMetadata('inject:tokens', existingTokens, target)
	}
}
