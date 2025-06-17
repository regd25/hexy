import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  # SOL Artifact Types
  enum ArtifactType {
    VISION
    CONCEPT
    DOMAIN
    POLICY
    PROCESS
    ACTOR
    INDICATOR
    RESULT
    SIGNAL
    OBSERVATION
    AUTHORITY
    PROTOCOL
  }

  enum ActorType {
    HUMAN
    SYSTEM
    AI_MODEL
  }

  enum ExecutionStatus {
    PENDING
    RUNNING
    COMPLETED
    FAILED
    CANCELLED
  }

  # Core SOL Artifact Interface
  interface SOLArtifact {
    id: String!
    type: ArtifactType!
    createdAt: String!
    updatedAt: String!
  }

  # Vision Type
  type Vision implements SOLArtifact {
    id: String!
    type: ArtifactType!
    content: String!
    author: String
    date: String
    language: String
    tags: [String!]
    createdAt: String!
    updatedAt: String!
  }

  # Concept Type
  type Concept implements SOLArtifact {
    id: String!
    type: ArtifactType!
    description: String!
    usedIn: [String!]
    tags: [String!]
    vision: String
    linkedPolicies: [String!]
    linkedProcesses: [String!]
    relatedIndicators: [String!]
    createdAt: String!
    updatedAt: String!
  }

  # Domain Type
  type Domain implements SOLArtifact {
    id: String!
    type: ArtifactType!
    description: String!
    vision: String!
    policies: [String!]
    processes: [String!]
    indicators: [String!]
    timeScope: String
    audience: [String!]
    governance: String
    createdAt: String!
    updatedAt: String!
  }

  # Policy Type
  type Policy implements SOLArtifact {
    id: String!
    type: ArtifactType!
    premise: String!
    vision: String!
    version: String!
    governance: String
    weight: Float
    category: String
    exceptions: [String!]
    createdAt: String!
    updatedAt: String!
  }

  # Process Step Type
  type ProcessStep {
    actor: String!
    action: String!
    order: Int!
  }

  # Process Type
  type Process implements SOLArtifact {
    id: String!
    type: ArtifactType!
    steps: [ProcessStep!]!
    vision: String!
    actors: [String!]!
    errorPaths: [String!]
    alternatePaths: [String!]
    timeLimits: String
    createdAt: String!
    updatedAt: String!
  }

  # Actor Type
  type Actor implements SOLArtifact {
    id: String!
    type: ArtifactType!
    actorType: ActorType!
    capabilities: [String!]
    domain: String!
    skills: [String!]
    version: String
    owner: String
    createdAt: String!
    updatedAt: String!
  }

  # Indicator Type
  type Indicator implements SOLArtifact {
    id: String!
    type: ArtifactType!
    description: String!
    measurement: String!
    unit: String!
    goal: Float
    domain: String!
    warning: Float
    critical: Float
    frequency: String
    createdAt: String!
    updatedAt: String!
  }

  # Result Type
  type Result implements SOLArtifact {
    id: String!
    type: ArtifactType!
    outcome: String!
    issuedBy: String!
    reason: String!
    timestamp: String!
    severity: String
    nextDomain: String
    tags: [String!]
    createdAt: String!
    updatedAt: String!
  }

  # Process Execution Types
  type ProcessExecution {
    id: String!
    processId: String!
    status: ExecutionStatus!
    startedAt: String!
    completedAt: String
    currentStep: Int
    totalSteps: Int!
    results: [ExecutionResult!]!
    errors: [ExecutionError!]!
  }

  type ExecutionResult {
    stepIndex: Int!
    actor: String!
    action: String!
    success: Boolean!
    output: String
    timestamp: String!
  }

  type ExecutionError {
    stepIndex: Int!
    message: String!
    code: String
    timestamp: String!
  }

  # Validation Types
  type ValidationResult {
    isValid: Boolean!
    errors: [ValidationError!]!
    warnings: [ValidationWarning!]!
    suggestions: [String!]!
  }

  type ValidationError {
    field: String!
    message: String!
    code: String!
  }

  type ValidationWarning {
    field: String!
    message: String!
    code: String!
  }

  # LLM Validation Types
  type LLMValidationResult {
    isValid: Boolean!
    confidence: Float!
    semanticAnalysis: String!
    suggestions: [String!]!
    contextualFeedback: String
  }

  # Input Types
  input ProcessExecutionInput {
    processId: String!
    context: String
    parameters: String
  }

  input ArtifactValidationInput {
    artifactId: String!
    artifactType: ArtifactType!
    content: String!
  }

  # Queries
  type Query {
    # Artifact Queries
    getArtifact(id: String!, type: ArtifactType!): SOLArtifact
    listArtifacts(type: ArtifactType, limit: Int, offset: Int): [SOLArtifact!]!
    
    # Process Queries
    getProcess(id: String!): Process
    listProcesses(domain: String, limit: Int, offset: Int): [Process!]!
    
    # Execution Queries
    getProcessExecution(id: String!): ProcessExecution
    listProcessExecutions(processId: String, status: ExecutionStatus, limit: Int, offset: Int): [ProcessExecution!]!
    
    # Validation Queries
    validateArtifact(input: ArtifactValidationInput!): ValidationResult!
    validateArtifactWithLLM(input: ArtifactValidationInput!): LLMValidationResult!
    
    # System Queries
    getEngineInfo: EngineInfo!
    getEngineHealth: EngineHealth!
  }

  # Mutations
  type Mutation {
    # Process Execution
    executeProcess(input: ProcessExecutionInput!): ProcessExecution!
    cancelProcessExecution(executionId: String!): Boolean!
    
    # Artifact Management
    createArtifact(type: ArtifactType!, content: String!): SOLArtifact!
    updateArtifact(id: String!, type: ArtifactType!, content: String!): SOLArtifact!
    deleteArtifact(id: String!, type: ArtifactType!): Boolean!
  }

  # Subscriptions
  type Subscription {
    processExecutionUpdates(executionId: String!): ProcessExecution!
    artifactChanges(type: ArtifactType): SOLArtifact!
  }

  # System Types
  type EngineInfo {
    name: String!
    version: String!
    description: String!
    capabilities: [String!]!
  }

  type EngineHealth {
    status: String!
    uptime: String!
    memoryUsage: String!
    activeExecutions: Int!
    totalExecutions: Int!
  }
`; 