import express, {
	type Express,
	type Request,
	type Response,
	type NextFunction,
	Router,
} from 'express'
import { Container } from '@/di'
import { getControllerMetadata } from './decorators/controller'
import { getRouteMetadata } from './decorators/route'
import { HttpMethod } from './types'
import bodyParser from 'body-parser'
import { getParamMetadata, extractParamValue } from './decorators/param'

/**
 * Configuration options for ExpressAdapter
 */
export interface ExpressAdapterOptions {
	/**
	 * Port to run the Express server on
	 */
	port?: number

	/**
	 * Global middleware to apply to all routes
	 */
	globalMiddleware?: ((
		req: Request,
		res: Response,
		next: NextFunction,
	) => void)[]

	/**
	 * Enable CORS
	 */
	enableCors?: boolean

	/**
	 * Enable JSON body parser
	 */
	enableBodyParser?: boolean
}

/**
 * Default configuration options
 */
const defaultOptions: ExpressAdapterOptions = {
	port: 3000,
	globalMiddleware: [],
	enableCors: true,
	enableBodyParser: true,
}

/**
 * Adapter for Express that integrates with Hexy's DI system
 */
export class ExpressAdapter {
	private app: Express
	private options: ExpressAdapterOptions
	private container: Container

	/**
	 * Create a new Express adapter
	 * @param container DI container
	 * @param options Configuration options
	 */
	constructor(container: Container, options: ExpressAdapterOptions = {}) {
		this.app = express()
		this.options = { ...defaultOptions, ...options }
		this.container = container
		this.setupMiddleware()
	}

	/**
	 * Get the Express application instance
	 */
	getApp(): Express {
		return this.app
	}

	/**
	 * Set up global middleware
	 */
	private setupMiddleware(): void {
		// Apply body parser if enabled
		if (this.options.enableBodyParser) {
			this.app.use(bodyParser.json())
			this.app.use(bodyParser.urlencoded({ extended: true }))
		}

		// Apply CORS if enabled
		if (this.options.enableCors) {
			this.app.use((req, res, next) => {
				res.header('Access-Control-Allow-Origin', '*')
				res.header(
					'Access-Control-Allow-Methods',
					'GET, POST, PUT, DELETE, PATCH',
				)
				res.header(
					'Access-Control-Allow-Headers',
					'Content-Type, Authorization',
				)
				next()
			})
		}

		// Apply global middleware
		if (
			this.options.globalMiddleware &&
			this.options.globalMiddleware.length > 0
		) {
			this.app.use(...this.options.globalMiddleware)
		}
	}

	/**
	 * Register controllers with the Express app
	 * @param controllers Controller classes with @Controller decorator
	 */
	registerControllers(controllers: any[]): void {
		for (const controllerClass of controllers) {
			this.registerController(controllerClass)
		}
	}

	/**
	 * Register a single controller
	 * @param controllerClass Controller class
	 */
	private registerController(controllerClass: any): void {
		const controllerMetadata = getControllerMetadata(controllerClass)
		if (!controllerMetadata) {
			console.warn(
				`Class ${controllerClass.name} is not a controller. Skipping registration.`,
			)
			return
		}

		// Resolve the controller instance from DI container
		const controllerInstance = this.container.resolve(controllerClass)

		// Create a router for this controller
		const router = Router()
		const basePath = controllerMetadata.path || ''

		// Get route metadata for all methods in the controller
		const prototype = Object.getPrototypeOf(controllerInstance)
		const methodNames = Object.getOwnPropertyNames(prototype).filter(
			(prop) => prop !== 'constructor' && typeof prototype[prop] === 'function',
		)

		// Register each route method
		for (const methodName of methodNames) {
			const routeMetadata = getRouteMetadata(
				controllerClass.prototype,
				methodName,
			)
			if (!routeMetadata) continue

			const { method, path } = routeMetadata
			const routeHandler = this.createRouteHandler(
				controllerInstance,
				methodName,
			)

			// Register the route handler with Express router
			this.registerRoute(router, method, path, routeHandler)
		}

		// Register the router with the Express app
		this.app.use(basePath, router)
	}

	/**
	 * Create a route handler function for Express
	 * @param controllerInstance Controller instance
	 * @param methodName Method name
	 */
	private createRouteHandler(
		controllerInstance: any,
		methodName: string,
	): (req: Request, res: Response, next: NextFunction) => void {
		// Get parameter metadata if available
		const paramsMetadata =
			getParamMetadata(Object.getPrototypeOf(controllerInstance), methodName) ||
			[]

		return async (req: Request, res: Response, next: NextFunction) => {
			try {
				// Prepare args based on parameter decorators
				const args = []

				// If we have parameter metadata, use it to build the arguments array
				if (paramsMetadata.length > 0) {
					// Sort parameters by index to ensure correct order
					const sortedParams = [...paramsMetadata].sort(
						(a, b) => a.index - b.index,
					)

					// For each parameter, extract its value from the request
					for (const param of sortedParams) {
						args[param.index] = extractParamValue(param, req, res, next)
					}
				}

				// Call the controller method with the prepared arguments
				const result = await controllerInstance[methodName](...args)

				// If the method returned a result and hasn't ended the response, send it
				if (result !== undefined && !res.headersSent) {
					res.json(result)
				}
			} catch (error) {
				next(error)
			}
		}
	}

	/**
	 * Register a route with the Express router
	 * @param router Express router
	 * @param method HTTP method
	 * @param path Route path
	 * @param handler Route handler function
	 */
	private registerRoute(
		router: Router,
		method: HttpMethod,
		path: string,
		handler: (req: Request, res: Response, next: NextFunction) => void,
	): void {
		switch (method) {
			case HttpMethod.GET:
				router.get(path, handler)
				break
			case HttpMethod.POST:
				router.post(path, handler)
				break
			case HttpMethod.PUT:
				router.put(path, handler)
				break
			case HttpMethod.DELETE:
				router.delete(path, handler)
				break
			case HttpMethod.PATCH:
				router.patch(path, handler)
				break
			default:
				throw new Error(`Unsupported HTTP method: ${method}`)
		}
	}

	/**
	 * Start the Express server
	 * @returns Promise that resolves when the server is started
	 */
	listen(): Promise<void> {
		return new Promise((resolve) => {
			const port = this.options.port || 3000
			this.app.listen(port, () => {
				console.log(`Server listening on port ${port}`)
				resolve()
			})
		})
	}
}
