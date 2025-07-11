# Core Abstractions - Hexy Framework

## 🎯 Overview

This directory contains the **stable core abstractions** that form the foundation of the Hexy Framework's extensible architecture. These interfaces are designed to **never change** as the framework scales, ensuring backwards compatibility and allowing unlimited extension without modification.

## 🏗️ Architecture Principles

### 1. **Interface Stability**

- All interfaces are designed to be **stable from day one**
- Extensions are added through **implementation**, not interface modification
- Backwards compatibility is **guaranteed**

### 2. **Open/Closed Principle**

- **Closed for modification**: Core interfaces never change
- **Open for extension**: New functionality through new implementations

### 3. **Dependency Inversion**

- High-level modules depend on **abstractions**, not concrete implementations
- Implementations can be **swapped** without affecting dependent code

## 📁 Core Abstractions

### 🔍 **ArtifactInterpreter<T>**

**File:** `ArtifactInterpreter.ts`

Generic interface for interpreting SOL artifacts. Enables adding new artifact types without modifying existing code.

```typescript
interface ArtifactInterpreter<T extends SOLArtifact> {
  canInterpret(artifact: SOLArtifact): artifact is T
  interpret(artifact: T, context: ExecutionContext): Promise<SemanticDecision>
  getRequiredCapabilities(): PluginCapability[]
}
```

**Extensibility:**

- Start with 3 artifact types (Intention, Condition, Workflow)
- Scale to 20+ types (Vision, Policy, Process, Actor, etc.)
- **Zero breaking changes** to existing interpreters

### ⚙️ **OrchestrationStrategy**

**File:** `OrchestrationStrategy.ts`

Strategy pattern for execution orchestration. Enables multiple orchestration modes without changing the core engine.

```typescript
interface OrchestrationStrategy {
  readonly name: string
  readonly supportedArtifactTypes: string[]
  canHandle(decision: SemanticDecision, context: ExecutionContext): boolean
  execute(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionResult>
}
```

**Extensibility:**

- Start with 1 strategy (Deterministic)
- Scale to 5+ strategies (Reactive, Choreographed, Hybrid, etc.)
- **Automatic strategy selection** based on artifact type

### 🧩 **Plugin System**

**File:** `PluginCapability.ts`

Comprehensive plugin architecture with capability-based discovery and execution.

```typescript
interface Plugin {
  readonly id: string
  readonly capabilities: PluginCapability[]
  execute(
    method: string,
    params: any[],
    context: ExecutionContext
  ): Promise<any>
  supportsCapability(capabilityId: string): boolean
}
```

**Extensibility:**

- Start with 1 plugin (NotificationPlugin)
- Scale to 50+ plugins (Database, Slack, Jira, etc.)
- **Capability-based discovery** and execution

### 💾 **ArtifactRepository<T>**

**File:** `ArtifactRepository.ts`

Generic repository interface for artifact storage. Supports multiple storage backends through the same interface.

```typescript
interface ArtifactRepository<T extends SOLArtifact> {
  save(artifact: T): Promise<string>
  findById(id: string): Promise<T | undefined>
  query(criteria: QueryCriteria): Promise<QueryResult<T>>
}
```

**Extensibility:**

- Start with filesystem storage
- Scale to database, cloud, distributed storage
- **Seamless backend switching** without code changes

### ✅ **ValidationRule<T>**

**File:** `ValidationRule.ts`

Generic validation rule interface. Enables adding validation rules without modifying the validation engine.

```typescript
interface ValidationRule<T extends SOLArtifact> {
  readonly id: string
  readonly category: ValidationCategory
  canValidate(artifact: SOLArtifact): artifact is T
  validate(artifact: T, context?: ExecutionContext): Promise<ValidationResult>
}
```

**Extensibility:**

- Start with basic syntax validation
- Scale to semantic, business, security rules
- **Composable validation** with rule dependencies

## 🚀 Extension Examples

### Adding a New Artifact Type

```typescript
// 1. Create interpreter (no changes to existing code)
class VisionInterpreter implements ArtifactInterpreter<VisionArtifact> {
  canInterpret(artifact: SOLArtifact): artifact is VisionArtifact {
    return artifact.type === "Vision"
  }

  async interpret(
    artifact: VisionArtifact,
    context: ExecutionContext
  ): Promise<SemanticDecision> {
    // Vision-specific interpretation logic
  }
}

// 2. Register with the system
artifactInterpreterRegistry.register("Vision", new VisionInterpreter())
```

### Adding a New Orchestration Mode

```typescript
// 1. Create strategy (no changes to existing code)
class ReactiveOrchestrator implements OrchestrationStrategy {
  readonly name = "reactive"
  readonly supportedArtifactTypes = ["Event", "Signal"]

  canHandle(decision: SemanticDecision): boolean {
    return this.supportedArtifactTypes.includes(decision.artifact.type)
  }

  async execute(
    decision: SemanticDecision,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Reactive orchestration logic
  }
}

// 2. Register with the system
orchestrationStrategyRegistry.register(new ReactiveOrchestrator())
```

### Adding a New Plugin

```typescript
// 1. Define capability
const EMAIL_CAPABILITY: PluginCapability = {
  id: "email-notification",
  name: "Email Notification",
  requiredMethods: ["sendEmail"],
}

// 2. Create plugin (no changes to existing code)
class EmailPlugin implements Plugin {
  readonly id = "email-plugin"
  readonly capabilities = [EMAIL_CAPABILITY]

  async execute(method: string, params: any[]): Promise<any> {
    if (method === "sendEmail") {
      // Email sending logic
    }
  }
}

// 3. Register with the system
pluginRegistry.registerCapability(EMAIL_CAPABILITY)
pluginRegistry.registerPlugin(new EmailPlugin())
```

## 📊 Scalability Demonstration

### Current State (Initial Implementation)

- **3 artifact types**: Intention, Condition, Workflow
- **1 orchestration mode**: Deterministic
- **1 plugin**: NotificationPlugin
- **1 storage backend**: FileSystem
- **5 validation rules**: Basic syntax and structure

### Future State (Full Scale)

- **20+ artifact types**: Vision, Policy, Process, Actor, etc.
- **5+ orchestration modes**: Reactive, Choreographed, Hybrid, etc.
- **50+ plugins**: Database, Slack, Jira, AWS, etc.
- **Multiple storage backends**: Database, Cloud, Distributed
- **100+ validation rules**: Semantic, Business, Security, etc.

**🎯 Key Point**: The transition from Current to Future State requires **ZERO breaking changes** to existing code. All extensions are additive through these stable abstractions.

## 🔧 Usage

```typescript
// Import all abstractions
import {
  ArtifactInterpreter,
  OrchestrationStrategy,
  Plugin,
  ArtifactRepository,
  ValidationRule,
} from "./abstractions"

// Use in your implementations
class MyCustomInterpreter implements ArtifactInterpreter<MyArtifact> {
  // Implementation
}
```

## 🏆 Benefits

### For Developers

- **Predictable interfaces**: Never worry about breaking changes
- **Clear extension points**: Know exactly how to add new functionality
- **Testable architecture**: Each abstraction can be mocked/stubbed
- **Modular development**: Work on extensions independently

### For the Framework

- **Unlimited scalability**: Add new functionality without limits
- **Backwards compatibility**: Existing code never breaks
- **Plugin ecosystem**: Third-party extensions without core changes
- **Maintainable codebase**: Changes are isolated to implementations

### For Users

- **Stable API**: User code remains compatible across versions
- **Extensible system**: Add custom functionality easily
- **Reliable upgrades**: No migration required for new features
- **Rich ecosystem**: Access to growing library of plugins

## 📋 Extension Checklist

When adding new functionality, ensure:

- [ ] **Implement the appropriate abstraction** (don't modify it)
- [ ] **Follow the same patterns** as existing implementations
- [ ] **Add comprehensive tests** for your implementation
- [ ] **Document the new functionality** clearly
- [ ] **Register with the appropriate registry** system
- [ ] **Verify backwards compatibility** with existing code

---

**These abstractions are the foundation of Hexy Framework's extensible architecture. They enable unlimited growth while maintaining stability and compatibility.**
