import { Injectable, UseCase } from '../../domain'

@Injectable()
export class GenerateContentUseCase
	implements UseCase<GenerateContentInput, GenerateContentOutput>
{
	constructor(private readonly aiService: AIService) {}

	async execute(input: GenerateContentInput): Promise<GenerateContentOutput> {
		/* ... */
	}
}
