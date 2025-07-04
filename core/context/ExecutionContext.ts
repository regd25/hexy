/**
 * Execution Context - Semantic contract that carries execution state
 * Transports actor, purpose, inputs, events, results, observations, and violations
 */

import { SOLArtifact, Actor, Intent, Context, Authority, Evaluation, Metadata } from '../artifacts/SOLArtifact';
import { OrchestrationMode } from '../types/OrchestrationMode';

export interface ExecutionState {
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  progress: number;
  startTime: Date;
  endTime?: Date;
  lastUpdateTime: Date;
}

export interface SemanticState {
  currentArtifact?: any;
  orchestrationMode?: OrchestrationMode;
  semanticReferences?: Record<string, any>;
  validationResults?: any[];
  decisions?: any[];
  startTime?: Date;
}

export interface ExecutionEvent {
  id: string;
  type: string;
  timestamp: Date;
  source: string;
  target?: string;
  payload: any;
  metadata: Metadata;
}

export interface ExecutionResult {
  id: string;
  type: 'success' | 'failure' | 'partial' | 'cancelled';
  value?: any;
  error?: Error;
  timestamp: Date;
  metadata: any;
}

export interface ExecutionObservation {
  id: string;
  observedBy: string;
  timestamp: Date;
  type: 'performance' | 'behavior' | 'error' | 'compliance';
  value: any;
  context: string;
  metadata: any;
}

export interface ExecutionViolation {
  id: string;
  type: 'policy' | 'semantic' | 'authority' | 'evaluation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  violatedArtifact: string;
  timestamp: Date;
  remediation?: string;
}

export class ExecutionContext {
  private readonly id: string;
  private readonly metadata: Metadata;
  
  // Semantic Components
  private actor: Actor;
  private intent: Intent;
  private context: Context;
  private authority: Authority;
  private evaluation: Evaluation | undefined;
  
  // Execution State
  private executionState: ExecutionState;
  private semanticState: SemanticState;
  
  // Event Collection
  private events: ExecutionEvent[] = [];
  private results: ExecutionResult[] = [];
  private observations: ExecutionObservation[] = [];
  private violations: ExecutionViolation[] = [];
  
  // Input/Output
  private inputs: Record<string, any> = {};
  private outputs: Record<string, any> = {};

  constructor(
    id: string,
    actor: Actor,
    intent: Intent,
    context: Context,
    authority: Authority,
    evaluation?: Evaluation
  ) {
    this.id = id;
    this.metadata = {
      id,
      version: '1.0.0',
      created: new Date(),
      lastModified: new Date(),
      status: 'active',
      author: actor.name,
      reviewedBy: [],
      tags: ['execution-context']
    };
    
    this.actor = actor;
    this.intent = intent;
    this.context = context;
    this.authority = authority;
    this.evaluation = evaluation;
    
    this.executionState = {
      status: 'pending',
      progress: 0,
      startTime: new Date(),
      lastUpdateTime: new Date()
    };
    
    this.semanticState = {};
  }

  // Getters
  getId(): string { return this.id; }
  getMetadata(): Metadata { return this.metadata; }
  getActor(): Actor { return this.actor; }
  getIntent(): Intent { return this.intent; }
  getContext(): Context { return this.context; }
  getAuthority(): Authority { return this.authority; }
  getEvaluation(): Evaluation | undefined { return this.evaluation; }
  getExecutionState(): ExecutionState { return this.executionState; }
  getSemanticState(): SemanticState { return this.semanticState; }

  // State Management
  updateExecutionState(updates: Partial<ExecutionState>): void {
    this.executionState = {
      ...this.executionState,
      ...updates,
      lastUpdateTime: new Date()
    };
  }

  updateSemanticState(updates: Partial<SemanticState>): void {
    this.semanticState = {
      ...this.semanticState,
      ...updates
    };
  }

  // Input/Output Management
  setInput(key: string, value: any): void {
    this.inputs[key] = value;
  }

  getInput(key: string): any {
    return this.inputs[key];
  }

  setOutput(key: string, value: any): void {
    this.outputs[key] = value;
  }

  getOutput(key: string): any {
    return this.outputs[key];
  }

  getAllInputs(): Record<string, any> {
    return { ...this.inputs };
  }

  getAllOutputs(): Record<string, any> {
    return { ...this.outputs };
  }

  // Event Management
  addEvent(event: Omit<ExecutionEvent, 'id' | 'timestamp'>): void {
    const fullEvent: ExecutionEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };
    this.events.push(fullEvent);
  }

  getEvents(): ExecutionEvent[] {
    return [...this.events];
  }

  getEventsByType(type: string): ExecutionEvent[] {
    return this.events.filter(event => event.type === type);
  }

  // Result Management
  addResult(result: Omit<ExecutionResult, 'id' | 'timestamp'>): void {
    const fullResult: ExecutionResult = {
      id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...result
    };
    this.results.push(fullResult);
  }

  getResults(): ExecutionResult[] {
    return [...this.results];
  }

  getLastResult(): ExecutionResult | undefined {
    return this.results[this.results.length - 1];
  }

  // Observation Management
  addObservation(observation: Omit<ExecutionObservation, 'id' | 'timestamp'>): void {
    const fullObservation: ExecutionObservation = {
      id: `obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...observation
    };
    this.observations.push(fullObservation);
  }

  getObservations(): ExecutionObservation[] {
    return [...this.observations];
  }

  getObservationsByType(type: ExecutionObservation['type']): ExecutionObservation[] {
    return this.observations.filter(obs => obs.type === type);
  }

  // Violation Management
  addViolation(violation: Omit<ExecutionViolation, 'id' | 'timestamp'>): void {
    const fullViolation: ExecutionViolation = {
      id: `viol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...violation
    };
    this.violations.push(fullViolation);
  }

  getViolations(): ExecutionViolation[] {
    return [...this.violations];
  }

  getViolationsBySeverity(severity: ExecutionViolation['severity']): ExecutionViolation[] {
    return this.violations.filter(viol => viol.severity === severity);
  }

  hasCriticalViolations(): boolean {
    return this.violations.some(viol => viol.severity === 'critical');
  }

  // Authority Validation
  validateAuthority(requiredAction: string): boolean {
    if (!this.authority) return false;
    
    // Check if authority is active and has required permissions
    if (!this.authority.isActive) return false;
    
    // Check if authority has permission for this action
    const hasPermission = this.authority.permissions.includes(requiredAction) || 
                         this.authority.permissions.includes('*');
    
    // Check if authority has jurisdiction over current context
    const hasJurisdiction = this.authority.jurisdiction.includes(this.context.scope) || 
                           this.authority.jurisdiction.includes('*');
    
    return hasPermission && hasJurisdiction;
  }

  // Intent Validation
  validateIntent(proposedAction: string): boolean {
    // Check if proposed action aligns with current intent
    return this.intent.mode === 'declare' || this.intent.mode === 'require';
  }

  // Context Validation
  isWithinContext(scope: string): boolean {
    // Check if current execution is within specified scope
    return this.context.scope === scope || this.context.scope === '*';
  }

  // Evaluation
  canEvaluate(): boolean {
    return this.evaluation !== undefined;
  }

  // Serialization
  toJSON(): any {
    return {
      id: this.id,
      metadata: this.metadata,
      actor: this.actor,
      intent: this.intent,
      context: this.context,
      authority: this.authority,
      evaluation: this.evaluation,
      executionState: this.executionState,
      semanticState: this.semanticState,
      events: this.events,
      results: this.results,
      observations: this.observations,
      violations: this.violations,
      inputs: this.inputs,
      outputs: this.outputs
    };
  }

  // Clone context for new execution branch
  clone(): ExecutionContext {
    const cloned = new ExecutionContext(
      `${this.id}-clone-${Date.now()}`,
      this.actor,
      this.intent,
      this.context,
      this.authority,
      this.evaluation
    );
    
    cloned.inputs = { ...this.inputs };
    cloned.semanticState = { ...this.semanticState };
    
    return cloned;
  }
} 