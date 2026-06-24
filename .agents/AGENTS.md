# Hexy Engine Design & Runtime Rules

Any development on Hexy (dashboard, core, or execution engine) must strictly adhere to the following architectural constraints and guidelines derived from the design debates.

## 1. Dashboard State & Decoupling (Composition over Inheritance)
- **Rule**: Do not extend semantic model classes directly to inject visual state.
- **Implementation**: Visual nodes in the dashboard (React/D3) must use a **composition pattern**. Wrap semantic payloads inside a container structure:
  ```ts
  interface DashboardNode {
    field: SemanticArtifactPayload; // Pure, immutable semantic model (no visual keys)
    visualState: {
      x: number;
      y: number;
      zoom: number;
      isSelected: boolean;
      interactionMeta: Record<string, unknown>;
    };
  }
  ```
- **Rationale**: Prevents UI interaction metadata from contaminating domain models, which would cause validation failures in the Hexy compiler.

## 2. Asynchronous and Optimistic UI Validations
- **Rule**: Never run recursive graph traversal, rule matching, or semantic validation on the main JavaScript thread during interactive events (e.g., drag-and-drop).
- **Implementation**: 
  - Offload execution to a **Web Worker** or an asynchronous service.
  - Apply an **optimistic UI model**: render connections immediately in a pending/grey state with a validation spinner, and emit validation requests asynchronously.
- **Rationale**: Keeps the UI responsive at 60 FPS, preventing jank/freezes with graphs scaling to 1000+ nodes and 5000+ relationships.

## 3. Logical Clocks and Cascading Rollbacks
- **Rule**: Validation responses must be version-tracked to prevent inconsistent states from fast editing.
- **Implementation**:
  - Implement a logical clock/timestamp for every graph mutative action.
  - If the validation engine rejects a parent relationship (e.g., `A -> B`), perform a **topological cascading rollback** to invalidate or flag all dependent downstream relations (e.g., `B -> C`) created under the same or later logical clock.
- **Rationale**: Avoids building entire invalid branches based on an optimistic UI premise.

## 4. AST-based Serialization & Cycle Detection
- **Rule**: Serializing visual graphs to ECOL files must never be performed via naive direct recursion.
- **Implementation**:
  - Implement a `Sub-Serializer Service` that constructs an in-memory **Abstract Syntax Tree (AST)** first.
  - Run depth-first search (DFS) or similar cycle detection algorithms before writing files.
  - If a cycle is detected or an area boundary is crossed, resolve nesting by emitting **anti-hallucination typed pointers** (e.g., `actor: RoleId`) instead of inline recursive embedding.
- **Rationale**: Prevents infinite loops and stack overflows in the browser when serializing cyclic dependencies.

## 5. Graduated Guardrails & Exception Levels
- **Rule**: Agent runtime validation must support graduated severity levels. Do not halt the execution loop on minor deviations.
- **Implementation**:
  - `INFO`: Log event details to the execution context trace.
  - `WARNING`: Log the violation, notify the agent to self-correct, and continue the execution loop.
  - `FATAL`: Immediately halt execution and invoke Human-in-the-Loop (HITL) for resolution.
- **Rationale**: Prevents the agent from freezing under "ontological paranoia" while maintaining high corporate auditability.

## 6. Strict Contract Resolution (Zero-Fuzzy Matching)
- **Rule**: Compile-time schema resolution must be absolute. Use strict validation (e.g., Zod schemas) for all boundary objects.
- **Implementation**: Do not allow the LLM to dynamically map or infer missing roles/actions (e.g., treating `WellnessManager` as `HRDirector` without an explicit semantic mapping rule). If a reference is unresolved, reject compilation immediately.
- **Rationale**: Hard prevention against AI hallucination of authority, roles, or actions.

## 7. Bounded Context Area Isolation & Federated Events
- **Rule**: Keep area schemas isolated (Bounded Contexts) but define explicit inter-area event interfaces for collaborative tasks.
- **Implementation**:
  - Sub-agents must only consume context pruned by SPARQL from their respective Area.
  - For cross-area actions, implement an asynchronous event bus contract where areas publish and subscribe to verified event schemas rather than sharing a monolithic context.
- **Rationale**: Prevents token bloat and "lost in the middle" context issues while allowing interdisciplinary problem-solving.
