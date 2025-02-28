#!/usr/bin/env ts-node

import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import { toPascalCase, toSnakeCase } from '../src/generator/utilities'

export function createSubscriber() {
	const program = new Command()

	program
		.name('create-subscriber')
		.description('Creates a new event subscriber')
		.argument('<name>', 'Subscriber name (e.g. send-welcome-email)')
		.argument('<event>', 'Event name (e.g. user-created)')
		.argument('<context>', 'Context name (e.g. user)')
		.option('-p, --path <path>', 'Base path for the subscriber', 'src')
		.action((name, event, context, options) => {
			const subscriberName = toPascalCase(name)
			const subscriberSnake = toSnakeCase(name)
			const eventName = toPascalCase(event)
			const contextPath = toSnakeCase(context)

			const basePath = path.join(
				options.path,
				contextPath,
				'application',
				'subscribers',
			)

			// Create directory if it doesn't exist
			if (!fs.existsSync(basePath)) {
				fs.mkdirSync(basePath, { recursive: true })
			}

			// Create subscriber file
			const content = `import { Injectable, EventSubscriber } from 'hexy';
import { ${eventName}Event } from '../../domain/events/${toSnakeCase(event)}.event';

@Injectable()
export class ${subscriberName} implements EventSubscriber<${eventName}Event> {
  constructor() {
    // Inject dependencies here
  }
  
  subscribedTo(): string[] {
    return [${eventName}Event.eventName()];
  }
  
  async on(event: ${eventName}Event): Promise<void> {
    // Handle the event
    console.log('Handling event', event);
  }
}
`

			fs.writeFileSync(
				path.join(basePath, `${subscriberSnake}.subscriber.ts`),
				content,
			)
			console.log(
				`Created subscriber: ${subscriberName} in ${basePath}/${subscriberSnake}.subscriber.ts`,
			)
		})

	program.parse(process.argv)
}

// Execute if called directly
if (require.main === module) {
	createSubscriber()
}
