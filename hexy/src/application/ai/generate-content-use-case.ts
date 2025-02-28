import { UseCase } from '../../domain/use-case/use-case'
import { AIService } from '../../shared/infrastructure/ai/ai-service'
import { Injectable } from '../../domain/dependency-injection'

export interface GenerateContentInput {
  prompt: string
  context?: Record<string, any>
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
}

export interface GenerateContentOutput {
  content: string
  metadata?: Record<string, any>
}

@Injectable()
export class GenerateContentUseCase implements UseCase<GenerateContentInput, GenerateContentOutput> {
  constructor(private readonly aiService: AIService) {}

  async execute(input: GenerateContentInput): Promise<GenerateContentOutput> {
    const response = await this.aiService.generateText(
      { content: input.prompt, context: input.context },
      input.options
    )
    
    return {
      content: response.content,
      metadata: response.metadata
    }
  }
} 