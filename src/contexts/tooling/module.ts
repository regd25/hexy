import { Module } from 'shared/di'
import { CreateContextUseCase } from './application/use-case/create-context.usecase'

@Module({
	providers: [
		{ provide: CreateContextUseCase, useClass: CreateContextUseCase },
	],
	exports: [CreateContextUseCase],
})
export class ToolingModule {}
