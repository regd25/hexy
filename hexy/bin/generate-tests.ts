#!/usr/bin/env ts-node

import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import { toPascalCase, toSnakeCase } from '../src/generator/utilities'

export function generateTests() {
	const program = new Command()
	program
		.option('--context <context>', 'Context name')
		.option('--service <service>', 'Service name')
		.option('--type <type>', 'Test type (unit, integration, e2e)', 'unit')
		.option(
			'--target <target>',
			'Target to test (aggregate, use-case, repository)',
		)
		.option('--name <name>', 'Name of the target')
		.parse(process.argv)

	const options = program.opts()
	const context = options.context
	const service = options.service
	const type = options.type
	const target = options.target
	const name = options.name

	if (!context || !service || !target || !name) {
		console.error('Context, service, target and name are required')
		process.exit(1)
	}

	const basePath = path.join('src', toSnakeCase(context), toSnakeCase(service))
	const testPath = path.join(basePath, '__tests__', type)

	// Create test directory
	fs.mkdirSync(testPath, { recursive: true })

	// Generate test file based on target type
	switch (target) {
		case 'aggregate':
			generateAggregateTest(testPath, name)
			break
		case 'use-case':
			generateUseCaseTest(testPath, name)
			break
		case 'repository':
			generateRepositoryTest(testPath, name)
			break
		default:
			console.error(`Unknown target type: ${target}`)
			process.exit(1)
	}
}

function generateAggregateTest(testPath: string, name: string) {
	const aggregatePascal = toPascalCase(name)
	const aggregateSnake = toSnakeCase(name)

	const content = `import { ${aggregatePascal} } from '../../domain/${aggregateSnake}';

describe('${aggregatePascal}', () => {
  it('should create a valid ${aggregatePascal}', () => {
    // Arrange
    const id = 'test-id';

    // Act
    const aggregate = ${aggregatePascal}.create(id);

		// Assert
		expect(aggregate).toBeDefined()
		expect(aggregate.id.value).toBe(id)
	})

  it('should throw error when creating with invalid data', () => {
    // Arrange & Act & Assert
    expect(() => {
      ${aggregatePascal}.create('');
    }).toThrow();
  });
});
`

	fs.writeFileSync(path.join(testPath, `${aggregateSnake}.spec.ts`), content)
	console.log(
		`Generated test for aggregate ${aggregatePascal} at ${testPath}/${aggregateSnake}.spec.ts`,
	)
}

function generateUseCaseTest(testPath: string, name: string) {
	const useCasePascal = toPascalCase(name)
	const useCaseSnake = toSnakeCase(name)

	const content = `import { ${useCasePascal} } from '../../application/${useCaseSnake}';

describe('${useCasePascal}', () => {
  let useCase: ${useCasePascal};

  beforeEach(() => {
    // Setup mocks and dependencies
    useCase = new ${useCasePascal}(/* mocked dependencies */);
  });

  it('should execute successfully with valid input', async () => {
    // Arrange
    const input = {
      // TODO: Add valid input data
    }

    // Act
    const result = await useCase.execute(input)

    // Assert
    expect(result).toBeDefined()
    // TODO: Add specific assertions
  })

  it('should throw error with invalid input', async () => {
    // Arrange
    const input = {
      // TODO: Add invalid input data
    }

    // Act & Assert
    await expect(useCase.execute(input)).rejects.toThrow()
  })
});
`

	fs.writeFileSync(path.join(testPath, `${useCaseSnake}.spec.ts`), content)
	console.log(
		`Generated test for use case ${useCasePascal} at ${testPath}/${useCaseSnake}.spec.ts`,
	)
}

function generateRepositoryTest(testPath: string, name: string) {
	const repositoryPascal = toPascalCase(name)
	const repositorySnake = toSnakeCase(name)

	const content = `import { ${repositoryPascal} } from '../../infrastructure/${repositorySnake}';

describe('${repositoryPascal}', () => {
  let repository: ${repositoryPascal};
  
  beforeEach(() => {
    // Setup repository with test database
    repository = new ${repositoryPascal}(/* test database */);
  });
  
  afterEach(() => {
    // Clean up test database
  });
  
  it('should save and retrieve an entity', async () => {
    // Arrange
    const entity = {
      // TODO: Create test entity
    };
    
    // Act
    await repository.save(entity);
    const retrieved = await repository.findById(entity.id);
    
    // Assert
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toEqual(entity.id);
  });
  
  it('should return null when entity not found', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id';
    
    // Act
    const result = await repository.findById(nonExistentId);
    
    // Assert
    expect(result).toBeNull();
  });
});
`

	fs.writeFileSync(path.join(testPath, `${repositorySnake}.spec.ts`), content)
	console.log(
		`Generated test for repository ${repositoryPascal} at ${testPath}/${repositorySnake}.spec.ts`,
	)
}
