/**
 * HexyEngine - Main entry point
 * Semantic Orchestration Language (SOL) execution engine
 */

// Domain entities exports
export * from './domain/entities/SOLArtifact';
export * from './domain/entities/Vision';
export * from './domain/entities/Concept';
export * from './domain/entities/Domain';
export * from './domain/entities/Policy';
export * from './domain/entities/Process';
export * from './domain/entities/Actor';
export * from './domain/entities/Indicator';
export * from './domain/entities/Result';

// Primary ports exports
export * from './ports/primary/SemanticInterpreterPort';
export * from './ports/primary/ExecutionEnginePort';

// Secondary ports exports - explicitly handle conflicts
export type { PersistencePort, SearchCriteria, ArtifactRelationship, TransactionContext, RelationshipType } from './ports/secondary/PersistencePort';
export type { 
  ProcessExecutionState as PersistenceProcessExecutionState,
  ExecutionHistoryEntry as PersistenceExecutionHistoryEntry,
  StepExecutionResult as PersistenceStepExecutionResult,
  ExecutionStatus as PersistenceExecutionStatus
} from './ports/secondary/PersistencePort';

export * from './ports/secondary/LLMValidationPort';

// Use cases exports
export * from './application/use-cases/ExecuteProcess';
export * from './application/use-cases/ValidateArtifact';
export * from './application/use-cases/ValidateArtifactWithLLM';

// Infrastructure exports
export * from './infrastructure/events/EventBus';

// Re-export common types and constants
export { EventTypes } from './infrastructure/events/EventBus';

/**
 * HexyEngine main class
 * Provides a high-level interface for SOL operations
 */
export class HexyEngine {
  private static instance: HexyEngine | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of HexyEngine
   */
  public static getInstance(): HexyEngine {
    if (!HexyEngine.instance) {
      HexyEngine.instance = new HexyEngine();
    }
    return HexyEngine.instance;
  }

  /**
   * Initialize the HexyEngine with configuration
   */
  public async initialize(config: HexyEngineConfig): Promise<void> {
    // TODO: Implement initialization logic
    // - Setup event bus
    // - Initialize persistence layer
    // - Configure semantic interpreter
    // - Setup execution engine
    // - Initialize LLM validation service
    console.log('HexyEngine initializing with config:', config);
  }

  /**
   * Get version information
   */
  public static getVersion(): string {
    return '0.1.0';
  }

  /**
   * Get engine information
   */
  public static getInfo(): EngineInfo {
    return {
      name: 'HexyEngine',
      version: HexyEngine.getVersion(),
      description: 'Semantic Orchestration Language (SOL) execution engine',
      capabilities: [
        'SOL artifact interpretation',
        'Process execution',
        'Semantic validation',
        'LLM-powered validation',
        'Event-driven architecture',
        'Hexagonal architecture'
      ]
    };
  }
}

export interface HexyEngineConfig {
  database?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  logging?: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
  execution?: {
    maxConcurrentProcesses: number;
    defaultTimeout: number;
  };
  llmValidation?: {
    endpoint: string;
    apiKey: string;
    model: string;
    timeout: number;
  };
}

export interface EngineInfo {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
} 