import { Injectable } from '../../domain/dependency-injection'

export interface AIServiceOptions {
	model?: string
	temperature?: number
	maxTokens?: number
}

export interface AIPrompt {
	content: string
	context?: Record<string, any>
}

export interface AIResponse {
	content: string
	metadata?: Record<string, any>
}

@Injectable()
export abstract class AIService {
	abstract generateText(
		prompt: AIPrompt,
		options?: AIServiceOptions,
	): Promise<AIResponse>
	abstract generateEmbedding(text: string): Promise<number[]>
	abstract classifyText(
		text: string,
		categories: string[],
	): Promise<Record<string, number>>
}
