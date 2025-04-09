import { Module } from '../dependency-injection/module'
import { Context } from './context'
import { ContextService } from './context-service'
import { CONTEXT_REPOSITORY_TOKEN, ACTIVE_CONTEXT_TOKEN } from './tokens'
import { MemoryContextRepository } from '../../infrastructure/context/memory-context-repository'

/**
 * @description Module for context management
 * Provides dependencies for creating and managing execution contexts
 */
@Module({
	providers: [
		{
			provide: CONTEXT_REPOSITORY_TOKEN,
			useClass: MemoryContextRepository,
		},
		{
			provide: ACTIVE_CONTEXT_TOKEN,
			useFactory: (contextService: ContextService) =>
				contextService.getActiveContext(),
			inject: [ContextService],
		},
		{ provide: Context, useClass: Context },
		{ provide: ContextService, useClass: ContextService },
	],
	exports: [
		CONTEXT_REPOSITORY_TOKEN,
		ACTIVE_CONTEXT_TOKEN,
		Context,
		ContextService,
	],
})
export class ContextModule {}
