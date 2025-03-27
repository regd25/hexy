#!/usr/bin/env ts-node

import { Command } from 'commander'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

export function createProject() {
  const program = new Command()
  program
    .option('--name <name>', 'Project name')
    .option('--preset <preset>', 'Project preset (starter, enterprise)', 'starter')
    .option('--testing <framework>', 'Testing framework (jest, mocha)', 'jest')
    .option('--messaging <service>', 'Messaging service (kafka, sqs, rabbitmq)', 'none')
    .option('--aws-cdk', 'Include AWS CDK support', false)
    .parse(process.argv)

  const options = program.opts()
  const projectName = options.name
  const preset = options.preset
  const testing = options.testing
  const messaging = options.messaging
  const awsCdk = options.awsCdk

  if (!projectName) {
    console.error('Project name is required')
    process.exit(1)
  }

  // Create project directory
  fs.mkdirSync(projectName, { recursive: true })
  process.chdir(projectName)

  // Initialize package.json
  execSync('npm init -y')

  // Install base dependencies
  execSync('npm install hexy typescript ts-node @types/node --save')
  
  // Install development dependencies
  execSync('npm install eslint prettier --save-dev')

  // Create project structure based on preset
  if (preset === 'starter') {
    createStarterStructure()
  } else if (preset === 'enterprise') {
    createEnterpriseStructure()
  }

  // Setup testing
  if (testing === 'jest') {
    execSync('npm install jest ts-jest @types/jest --save-dev')
    createJestConfig()
  } else if (testing === 'mocha') {
    execSync('npm install mocha chai @types/mocha @types/chai --save-dev')
    createMochaConfig()
  }

  // Setup messaging
  if (messaging === 'kafka') {
    execSync('npm install kafkajs --save')
    createKafkaConfig()
  } else if (messaging === 'sqs') {
    execSync('npm install @aws-sdk/client-sqs --save')
    createSQSConfig()
  } else if (messaging === 'rabbitmq') {
    execSync('npm install amqplib @types/amqplib --save')
    createRabbitMQConfig()
  }

  // Setup AWS CDK
  if (awsCdk) {
    execSync('npm install aws-cdk-lib constructs --save')
    execSync('npm install aws-cdk @aws-cdk/aws-lambda-nodejs esbuild --save-dev')
    createCDKConfig()
  }

  console.log(`Project ${projectName} created successfully with preset ${preset}`)
}

function createStarterStructure() {
  // Create basic structure for starter preset
  const directories = [
    'src/shared/domain',
    'src/shared/application',
    'src/shared/infrastructure',
    'src/contexts/example/domain',
    'src/contexts/example/application',
    'src/contexts/example/infrastructure',
  ]

  directories.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true })
  })

  // Create basic files
  fs.writeFileSync('src/index.ts', `import { Hexy } from '@hexy/domain';\n\nconst app = new Hexy();\napp.start();`)
}

function createEnterpriseStructure() {
  // Create advanced structure for enterprise preset
  const directories = [
    'src/shared/domain',
    'src/shared/application',
    'src/shared/infrastructure',
    'src/contexts/example/domain/aggregates',
    'src/contexts/example/domain/events',
    'src/contexts/example/domain/repositories',
    'src/contexts/example/domain/services',
    'src/contexts/example/domain/value-objects',
    'src/contexts/example/application/commands',
    'src/contexts/example/application/queries',
    'src/contexts/example/application/subscribers',
    'src/contexts/example/infrastructure/persistence',
    'src/contexts/example/infrastructure/messaging',
    'src/contexts/example/infrastructure/controllers',
  ]

  directories.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true })
  })

  // Create advanced files
  fs.writeFileSync('src/index.ts', `import { Hexy } from 'hexy';\n\nconst app = new Hexy();\napp.start();`)
}

function createJestConfig() {
  const jestConfig = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
  }

  fs.writeFileSync('jest.config.js', `module.exports = ${JSON.stringify(jestConfig, null, 2)}`)
}

function createMochaConfig() {
  const mochaConfig = {
    require: 'ts-node/register',
    extension: ['ts'],
    spec: 'src/**/*.spec.ts',
  }

  fs.writeFileSync('.mocharc.json', JSON.stringify(mochaConfig, null, 2))
}

function createKafkaConfig() {
  fs.mkdirSync('src/shared/infrastructure/messaging/kafka', { recursive: true })
  
  const kafkaConfig = `import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'hexy-app',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
});
`

  fs.writeFileSync('src/shared/infrastructure/messaging/kafka/kafka-config.ts', kafkaConfig)
}

function createSQSConfig() {
  fs.mkdirSync('src/shared/infrastructure/messaging/sqs', { recursive: true })
  
  const sqsConfig = `import { SQSClient } from '@aws-sdk/client-sqs';

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
});
`

  fs.writeFileSync('src/shared/infrastructure/messaging/sqs/sqs-config.ts', sqsConfig)
}

function createRabbitMQConfig() {
  fs.mkdirSync('src/shared/infrastructure/messaging/rabbitmq', { recursive: true })
  
  const rabbitmqConfig = `import * as amqp from 'amqplib';

export async function createRabbitMQConnection() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  return connection;
}
`

  fs.writeFileSync('src/shared/infrastructure/messaging/rabbitmq/rabbitmq-config.ts', rabbitmqConfig)
}

function createCDKConfig() {
  fs.mkdirSync('infrastructure/cdk', { recursive: true })
  
  const cdkConfig = `import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class HexyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define Lambda function
    const apiHandler = new lambda.NodejsFunction(this, 'ApiHandler', {
      entry: path.join(__dirname, '../../src/index.ts'),
      handler: 'handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      },
    });
  }
}
`

  fs.writeFileSync('infrastructure/cdk/hexy-stack.ts', cdkConfig)
} 