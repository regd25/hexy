import { UseCase } from '@/shared'

// Mock implementation of UseCase for testing
class TestUseCase extends UseCase<string, number> {
	async execute(input: string): Promise<number> {
		return input.length
	}
}

// Mock implementation with error for testing
class ErrorUseCase extends UseCase<string, number> {
	async execute(input: string): Promise<number> {
		throw new Error('Test error')
	}
}

describe('UseCase', () => {
	describe('run', () => {
		it('should execute the use case and return the result', async () => {
			const useCase = new TestUseCase()
			const input = 'test input'

			const result = await useCase.run(input)

			expect(result).toBe(10) // Length of 'test input'
		})

		it('should handle errors thrown during execution', async () => {
			const useCase = new ErrorUseCase()
			const input = 'test input'

			await expect(useCase.run(input)).rejects.toThrow('Test error')
		})
	})
})
