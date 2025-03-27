import { AIService } from '../../infrastructure/ai/ai-service'
import { UseCase, UseCaseInput, UseCaseOutput, Injectable } from '../../domain'

export interface GenerateContentInput extends UseCaseInput {
	prompt: string
	context?: Record<string, any>
	options?: {
		model?: string
		temperature?: number
		maxTokens?: number
	}
}

export interface GenerateContentOutput extends UseCaseOutput {
	content: string
	metadata?: Record<string, any>
}

@Injectable()
export class GenerateContentUseCase extends UseCase<
	GenerateContentInput,
	GenerateContentOutput
> {
	constructor(private readonly aiService: AIService) {
		super()
	}

	async execute(input: GenerateContentInput): Promise<GenerateContentOutput> {
		const response = await this.aiService.generateText(
			{ content: input.prompt, context: input.context },
			input.options,
		)

		return {
			content: response.content,
			metadata: response.metadata,
		}
	}
}
