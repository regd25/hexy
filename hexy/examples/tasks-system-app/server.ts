import { container, ExpressAdapter } from 'hexy'
import { MainModule } from './main-module'
import { TaskController } from './task/infrastructure/controllers/task-controller'

async function bootstrap() {
	// Initialize the application module
	const mainModule = new MainModule()

	// Register all providers from the application module
	const providers = mainModule.getAllProviders()
	container.registerMany(providers)

	// Create Express adapter
	const expressAdapter = new ExpressAdapter(container, {
		port: 3000,
		enableCors: true,
		enableBodyParser: true,
	})

	// Register controllers
	expressAdapter.registerControllers([TaskController])

	// Start the server
	await expressAdapter.listen()
	console.log('Task Management API is running on http://localhost:3000')
}

console.log('Starting the application...')
// Start the application
bootstrap().catch((error) => {
	console.error('Failed to start the application:', error)
	process.exit(1)
})
