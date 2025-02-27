#!/usr/bin/env ts-node

import { Command } from 'commander';
import { interactiveMode } from '../src/cli/interactive';
import { createServiceStructure } from '../src/generator/serviceStructure';
import { createValueObjectFile } from '../src/generator/valueObjectGenerator';
import { createAggregateFile } from '../src/generator/aggregateGenerator';
import { createRepositoryFile } from '../src/generator/repositoryGenerator';
import { createUseCaseFile } from '../src/generator/useCaseGenerator';
import { toPascalCase } from '../src/generator/utilities';

async function main() {
  const program = new Command();
  program
    .option('--context <context>', 'Context name')
    .option('--service-name <serviceName>', 'Service name')
    .option('--aggregate <aggregate>', 'Aggregate name')
    .option('--value-objects [valueObjects...]')
    .option('--use-cases [useCases...]')
    .option('--repository <repository>', 'Repository name')
    .parse(process.argv);

  const options = program.opts();
  let context: string = options.context;
  let serviceName: string = options.serviceName;
  let aggregate: string = options.aggregate;
  let valueObjects: string[] = options.valueObjects || [];
  let useCases: string[] = options.useCases || [];
  let repository: string = options.repository;

  // If required options are missing, use interactive mode
  if (!context || !serviceName) {
    const interactiveData = await interactiveMode();
    context = interactiveData.context;
    serviceName = interactiveData.serviceName;
    aggregate = interactiveData.aggregate;
    valueObjects = interactiveData.valueObjects;
    useCases = interactiveData.useCases;
    repository = interactiveData.repository;
  }

  // Defaults if not provided
  if (!aggregate) {
    aggregate = serviceName;
  }
  if (!repository) {
    repository = `${toPascalCase(aggregate)}Repository`;
  }

  const basePath = createServiceStructure(context, serviceName);

  if (valueObjects.length > 0) {
    valueObjects.forEach((vo: string) => {
      const parts = vo.split(':');
      const voName = parts[0];
      const voType = parts[1];
      createValueObjectFile(basePath, voName, voType);
    });
  }

  // Create aggregate using the provided aggregate or default to service name
  createAggregateFile(
    basePath,
    aggregate,
    valueObjects.map((vo: string) => {
      const parts = vo.split(':');
      return { name: parts[0], type: parts[1] };
    })
  );

  // Create repository file with default repository name if not provided
  createRepositoryFile(basePath, repository, aggregate);

  if (useCases.length > 0) {
    useCases.forEach((useCase: string) => {
      createUseCaseFile(basePath, useCase, aggregate);
    });
  }
}

main();