#!/usr/bin/env ts-node

import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import { toPascalCase, toSnakeCase } from '../src/generator/utilities'

export function createEvent() {
	const program = new Command()

	program
		.name('create-event')
		.description('Creates a new domain event')
		.argument('<name>', 'Event name (e.g. user-created)')
		.argument('<context>', 'Context name (e.g. user)')
		.option('-p, --path <path>', 'Base path for the event', 'src')
		.action((name, context, options) => {
			const eventName = toPascalCase(name)
			const eventSnake = toSnakeCase(name)
			const contextPath = toSnakeCase(context)

			const basePath = path.join(options.path, contextPath, 'domain', 'events')

			// Create directory if it doesn't exist
			if (!fs.existsSync(basePath)) {
				fs.mkdirSync(basePath, { recursive: true })
			}

			// Create event file
			const content = `import { DomainEvent, DomainEventDecorator } from '@hexy/domain';


interface ${eventName}Data {
  // TODO: Add event properties
}

@DomainEventDecorator()
export class ${eventName}Event extends DomainEvent {
  // TODO: Add event properties
  
  constructor(data: ${eventName}Data) {
    super();
    // TODO: Initialize properties
  }
  
  static eventName(): string {
    return '${context}.${name.replace(/-/g, '.')}';
  }
  
  static fromPrimitives(params: any): ${eventName}Event {
    return new ${eventName}Event({
      // TODO: Map properties from params
    });
  }
  
  toPrimitives(): any {
    return {
      // TODO: Return primitive representation
    };
  }
}
`

			fs.writeFileSync(path.join(basePath, `${eventSnake}.event.ts`), content)
			console.log(
				`Created event: ${eventName}Event in ${basePath}/${eventSnake}.event.ts`,
			)
		})

	program.parse(process.argv)
}

// Execute if called directly
if (require.main === module) {
	createEvent()
}
