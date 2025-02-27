#!/usr/bin/env node
import { program } from 'commander'
import { createService } from './create-service'

/**
 * Hexy CLI
 *
 * This is the entry point for the Hexy CLI.
 * It provides utility commands to interact with the framework.
 */
program.version('1.0.0').description('Hexy CLI')

program
	.command('info')
	.description(
		`
    Hexy is a DDD framework for Typescript.
    It provides a set of tools to help you build your DDD architecture.
    Usage:
    $ hexy info
    $ hexy create
    `,
	)
	.action(() => {
		console.log('Hexy DDD Typescript Framework - Version 1.0.0')
	})

program
	.command('create')
	.description('Create a new project')
	.action(() => {
		return createService()
	})

program.parse(process.argv)
