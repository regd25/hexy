import { createToken } from '../../shared/di/token'
import { type IContextRepository } from './context-repository'
import { Context } from './context'

/**
 * Token for the context repository
 */
export const CONTEXT_REPOSITORY_TOKEN =
	createToken<IContextRepository>('ContextRepository')

/**
 * Token for the active context
 */
export const ACTIVE_CONTEXT_TOKEN = createToken<Context>('ActiveContext')
