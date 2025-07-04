/**
 * Orchestration modes for Hexy Framework
 * Defines how the semantic engine executes processes
 */

export enum OrchestrationMode {
  /**
   * Orchestrator Mode - Hexy executes step by step a defined process, 
   * evaluating semantic conditions between nodes
   */
  ORCHESTRATOR = 'orchestrator',
  
  /**
   * Reactive Mode - Hexy listens to system events and validates 
   * if each action is coherent, allowed, or needs intervention
   */
  REACTIVE = 'reactive',
  
  /**
   * Choreographed Mode - Hexy coordinates distributed execution 
   * without central control, actors self-organize
   */
  CHOREOGRAPHED = 'choreographed'
}

export interface OrchestrationConfig {
  mode: OrchestrationMode;
  timeout?: number;
  retryStrategy?: RetryStrategy;
  fallbackMode?: OrchestrationMode;
  monitoring?: MonitoringConfig;
}

export interface RetryStrategy {
  maxRetries: number;
  backoffType: 'linear' | 'exponential' | 'custom';
  baseDelay: number;
  maxDelay: number;
  retryCondition?: (error: Error) => boolean;
}

export interface MonitoringConfig {
  enableMetrics: boolean;
  enableTracing: boolean;
  enableLogging: boolean;
  metricsInterval: number;
}

export type OrchestrationResult = {
  mode: OrchestrationMode;
  success: boolean;
  duration: number;
  steps: number;
  errors: Error[];
  metadata: Record<string, any>;
}; 