import { AIPrompt, AIResponse, AIService, AIServiceOptions } from './ai-service'
import { Injectable } from '../../domain/dependency-injection'

@Injectable()
export class OpenAIService implements AIService {
	constructor(private readonly apiKey: string) {}

	async generateText(
		prompt: AIPrompt,
		options?: AIServiceOptions,
	): Promise<AIResponse> {
		// Implementation for OpenAI API call
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: options?.model || 'gpt-4o-mini',
				prompt: prompt.content,
				temperature: options?.temperature || 0.7,
				max_tokens: options?.maxTokens || 150,
			}),
		})

		const data = await response.json()

		return {
			content: data.choices[0].text,
			metadata: {
				model: data.model,
				usage: data.usage,
			},
		}
	}

	async generateEmbedding(text: string): Promise<number[]> {
		// Implementation for embeddings
		const response = await fetch('https://api.openai.com/v1/embeddings', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: 'text-embedding-ada-002',
				input: text,
			}),
		})

		const data = await response.json()
		return data.data[0].embedding
	}

	async classifyText(
		text: string,
		categories: string[],
	): Promise<Record<string, number>> {
		// Implementation for classification using embeddings and comparison
		const result: Record<string, number> = {}
		categories.forEach((category) => {
			// Simplified implementation
			result[category] = Math.random()
		})

		return result
	}
}
