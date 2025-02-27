import * as readline from 'readline'
import { toPascalCase } from '../generator/utilities'

/**
 * Interactive mode to get configuration from the user.
 * @returns An object with the service configuration.
 */
export async function interactiveMode(): Promise<{
	context: string
	serviceName: string
	aggregate: string
	valueObjects: string[]
	useCases: string[]
	repository: string
}> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	const question = (q: string): Promise<string> =>
		new Promise((resolve) => rl.question(q, resolve))

	let context = await question('Ingresa el nombre del contexto: ')
	while (!context.trim()) {
		context = await question(
			'El contexto es obligatorio. Ingresa el nombre del contexto: ',
		)
	}

	let serviceName = await question('Ingresa el nombre del servicio: ')
	while (!serviceName.trim()) {
		serviceName = await question(
			'El nombre del servicio es obligatorio. Ingresa el nombre del servicio: ',
		)
	}

	let aggregate = await question(
		`Ingresa el nombre del agregado [${serviceName}]: `,
	)
	if (!aggregate.trim()) {
		aggregate = serviceName
	}

	const valueObjects: string[] = []
	console.log(
		'Ingresa los Value Objects con su tipo en formato VOName:tipo (deja en blanco para terminar):',
	)
	const allowedTypes = [
		'string',
		'integer',
		'float',
		'boolean',
		'uuid',
		'email',
		'phone',
		'money',
		'number_id',
		'date',
		'enum',
	]
	while (true) {
		const vo = await question('Nombre del Value Object: ')
		if (!vo.trim()) break
		let voType = await question(`Tipo del Value Object (${vo}): `)
		while (!allowedTypes.includes(voType.toLowerCase())) {
			console.log(
				'Tipo inválido. Los tipos permitidos son: ' + allowedTypes.join(', '),
			)
			voType = await question(`Tipo del Value Object (${vo}): `)
		}
		valueObjects.push(`${vo}:${voType}`)
	}

	const useCases: string[] = []
	console.log('Ingresa los Casos de Uso (deja en blanco para terminar):')
	while (true) {
		const uc = await question('Caso de Uso: ')
		if (!uc.trim()) break
		useCases.push(uc)
	}

	let repository = await question(
		`Ingresa el nombre del repositorio [${toPascalCase(aggregate)}Repository]: `,
	)
	if (!repository.trim()) {
		repository = `${toPascalCase(aggregate)}Repository`
	}

	rl.close()
	return { context, serviceName, aggregate, valueObjects, useCases, repository }
}
