#!/usr/bin/env node

import { Command } from 'commander'
import { CreateContextCommand } from './contexts/tooling/infrastructure/cli/create-context.command'
import * as chalk from 'chalk'

// Create command line program
const program = new Command()

// Define main CLI info
program
	.name('hexy')
	.description(
		'Hexy CLI - Herramientas para desarrollo de arquitectura hexagonal',
	)
	.version('1.0.0')

// Register commands from contexts
CreateContextCommand.register(program)

// Add more commands here as they are implemented

// Display ASCII art header
console.log(
	chalk.cyan(`
 _    _                   
| |  | |                  
| |__| | _____  ___   _   
|  __  |/ _ \\ \\/ / | | |  
| |  | |  __/>  <| |_| |  
|_|  |_|\\___/_/\\_\\\\__, |  
                   __/ |  
                  |___/   
`),
)
console.log(chalk.gray('Hexy - CLI para arquitectura hexagonal y DDD\n'))

// Parse command line arguments
program.parse(process.argv)

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
	program.outputHelp()
}
