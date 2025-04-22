import * as fs from 'fs/promises'
import * as path from 'path'
import {
	CreateContextUseCase,
	CreateContextInput,
} from '../application/use-case/create-context.usecase'

// Mock fs/promises
jest.mock('fs/promises', () => ({
	access: jest.fn(),
	mkdir: jest.fn(),
	writeFile: jest.fn(),
}))

describe('CreateContextUseCase', () => {
	let useCase: CreateContextUseCase

	beforeEach(() => {
		useCase = new CreateContextUseCase()
		jest.resetAllMocks()
	})

	it('should create context directories and files when context does not exist', async () => {
		// Arrange
		const mockInput = new CreateContextInput('test-context')

		// Mock fs/promises.access to throw ENOENT to simulate non-existing directory
		const accessError = new Error('ENOENT')
		;(accessError as any).code = 'ENOENT'
		;(fs.access as jest.Mock).mockRejectedValueOnce(accessError)

		// Act
		const result = await useCase.execute(mockInput)

		// Assert
		expect(result.success).toBe(true)
		expect(result.message).toContain('test-context')
		expect(fs.mkdir).toHaveBeenCalledTimes(3)
		expect(fs.writeFile).toHaveBeenCalledTimes(4) // module.ts + 3 .gitkeep files

		// Verify paths
		const basePath = path.join('src', 'contexts', 'test-context')
		expect(fs.mkdir).toHaveBeenCalledWith(path.join(basePath, 'domain'), {
			recursive: true,
		})
		expect(fs.mkdir).toHaveBeenCalledWith(path.join(basePath, 'application'), {
			recursive: true,
		})
		expect(fs.mkdir).toHaveBeenCalledWith(
			path.join(basePath, 'infrastructure'),
			{ recursive: true },
		)

		// Verify module.ts content
		const moduleFilePath = path.join(basePath, 'module.ts')
		const moduleFileCall = (fs.writeFile as jest.Mock).mock.calls.find(
			(call) => call[0] === moduleFilePath,
		)
		expect(moduleFileCall).toBeDefined()
		expect(moduleFileCall[1]).toContain('TestContextModule')
	})

	it('should return failure when context already exists', async () => {
		// Arrange
		const mockInput = new CreateContextInput('existing-context')

		// Mock fs/promises.access to return successfully (indicating dir exists)
		;(fs.access as jest.Mock).mockResolvedValueOnce(undefined)

		// Act
		const result = await useCase.execute(mockInput)

		// Assert
		expect(result.success).toBe(false)
		expect(result.message).toContain('already exists')
		expect(fs.mkdir).not.toHaveBeenCalled()
		expect(fs.writeFile).not.toHaveBeenCalled()
	})

	it('should handle and return error information if creation fails', async () => {
		// Arrange
		const mockInput = new CreateContextInput('failing-context')

		// Mock fs/promises.access to throw ENOENT
		const accessError = new Error('ENOENT')
		;(accessError as any).code = 'ENOENT'
		;(fs.access as jest.Mock).mockRejectedValueOnce(accessError)

		// Mock fs/promises.mkdir to throw error
		const creationError = new Error('Creation failed')
		;(fs.mkdir as jest.Mock).mockRejectedValueOnce(creationError)

		// Act
		const result = await useCase.execute(mockInput)

		// Assert
		expect(result.success).toBe(false)
		expect(result.message).toContain('Failed to create context')
		expect(result.message).toContain('Creation failed')
	})
})
