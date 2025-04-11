import { ExpressAdapter } from 'src/core/http'
import { container, getModuleFromClass } from 'src/core/di'
import { TaskController } from './task/infrastructure/controllers/task-controller'
import { MainModule } from './main-module'

async function bootstrap() {
	console.log('Iniciando aplicación...')

	// Crear una instancia del módulo principal
	const mainModule = getModuleFromClass(MainModule)
	if (!mainModule) {
		throw new Error('MainModule not found')
	}
	// Registrar automáticamente todas las dependencias del módulo principal
	const providers = mainModule.getAllProviders()
	console.log(`Registrando ${providers.length} proveedores...`)
	container.registerMany(providers)

	// Crear el adaptador Express
	console.log('Configurando Express...')
	const expressAdapter = new ExpressAdapter(container, {
		port: 3000,
		enableCors: true,
		enableBodyParser: true,
	})

	// Registrar el controlador de tareas
	console.log('Registrando controladores...')
	expressAdapter.registerControllers([TaskController])

	// Iniciar el servidor
	await expressAdapter.listen()
	console.log('Task Management API corriendo en http://localhost:3000')
}

console.log('Arrancando aplicación...')
bootstrap().catch((error) => {
	console.error('Error al iniciar la aplicación:', error)
	process.exit(1)
})
