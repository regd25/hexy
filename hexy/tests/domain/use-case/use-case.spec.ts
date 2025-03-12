import { UseCase } from 'hexy'

// Mock implementation of UseCase for testing
class TestUseCase extends UseCase<{
	message: string
}, {
	length: number
}> {
	async execute(input: {
		message: string
	}): Promise<{
		length: number
	}> {
		return { length: input.message.length }
	}
}

// Mock implementation with error for testing
class ErrorUseCase extends UseCase<{
	message: string
}, {
	length: number
}> {
	async execute(input: {
		message: string
	}): Promise<{
		length: number
	}> {
		throw new Error('Test error')
	}
}

describe('UseCase', () => {
	describe('run', () => {
		it('should execute the use case and return the result', async () => {
			const useCase = new TestUseCase()
			const input = 'test input'

			const result = await useCase.run({ message: input }	)

			expect(result).toBe(10) // Length of 'test input'
		})

		it('should handle errors thrown during execution', async () => {
			const useCase = new ErrorUseCase()
			const input = 'test input'

			await expect(useCase.run({ message: input })).rejects.toThrow('Test error')
		})
	})
})
