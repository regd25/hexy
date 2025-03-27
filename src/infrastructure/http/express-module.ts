import { Module, ModuleDecorator } from '../../domain/dependency-injection'
import {
	ExpressAdapter,
	ExpressAdapterOptions,
} from './express/express-adapter'
import { Container } from '../../domain/dependency-injection'

/**
 * Options for the Express module
 */
export interface ExpressModuleOptions {
	/**
	 * Express adapter options
	 */
	expressOptions?: ExpressAdapterOptions

	/**
	 * Controller classes to register
	 */
	controllers: any[]
}

/**
 * Module for Express integration
 */
@ModuleDecorator({
	providers: [],
})
export class ExpressModule extends Module {
	private expressAdapter: ExpressAdapter
	private container: Container
	private options: ExpressModuleOptions

	/**
	 * Create a new Express module
	 * @param container DI container
	 * @param options Module options
	 */
	constructor(container: Container, options: ExpressModuleOptions) {
		super({
			providers: [],
		})

		this.container = container
		this.options = options
		this.expressAdapter = new ExpressAdapter(container, options.expressOptions)
	}

	/**
	 * Initialize the Express application
	 */
	initialize(): void {
		// Register controllers
		this.expressAdapter.registerControllers(this.options.controllers)
	}

	/**
	 * Start the Express server
	 */
	async listen(): Promise<void> {
		await this.expressAdapter.listen()
	}

	/**
	 * Get the Express application instance
	 */
	getExpressApp() {
		return this.expressAdapter.getApp()
	}
}
