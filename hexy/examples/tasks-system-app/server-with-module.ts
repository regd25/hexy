import { container, ExpressModule } from 'hexy'
import { TaskController } from './task/infrastructure/controllers/task-controller'
import { MainModule } from './main-module'

async function bootstrap() {
	const mainModule = new MainModule()
	const providers = mainModule.getAllProviders()
	container.registerMany(providers)

	// Create and initialize Express module
	const expressModule = new ExpressModule(container, {
		expressOptions: {
			port: 3000,
			enableCors: true,
			enableBodyParser: true,
		},
		controllers: [TaskController],
	})

	// Initialize Express (register controllers)
	expressModule.initialize()

	// Start the server
	await expressModule.listen()
	console.log('Task Management API is running on http://localhost:3000')
}

// Start the application
bootstrap().catch((error) => {
	console.error('Failed to start the application:', error)
	process.exit(1)
})
