import { Module, ModuleClass } from 'shared/di'
import {
	ExpressAdapter,
	type ExpressAdapterOptions,
} from './express/express-adapter'
import { Container } from 'shared/di'

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
@Module({
	providers: [],
})
export class ExpressModule extends ModuleClass {
	private expressAdapter: ExpressAdapter

	/**
	 * Create a new Express module
	 * @param container DI container
	 * @param options Module options
	 */
	constructor(
		private readonly container: Container,
		private readonly options: ExpressModuleOptions,
	) {
		super({
			providers: [],
		})

		this.expressAdapter = new ExpressAdapter(container, options.expressOptions)
	}

	/**
	 * Initialize the Express application
	 */
	async initialize(): Promise<void> {
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
