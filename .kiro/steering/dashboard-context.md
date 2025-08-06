# Dashboard Project Context - Steering Rules

## Project Overview

The Hexy Dashboard is a React + TypeScript application for visualizing and editing semantic artifacts. It serves as the primary interface for interacting with the Hexy Framework's organizational modeling capabilities.

## Current Architecture Status

### Completed Systems ✅

- **Artifact Editor**: Full CRUD with @ mention autocomplete
- **State Management**: Zustand store with temporal artifacts
- **Notification System**: Toast notifications with event-driven architecture
- **UI Structure**: Modern Tailwind CSS with dark theme
- **Autocomplete System**: @ mention references with keyboard navigation
- **Temporal Artifacts**: Robust lifecycle management with validation
- **Interactive Graph**: D3.js visualization with inline editing

### Technical Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 3.4+ (dark theme, slate/blue palette)
- **State**: Zustand for global state management
- **Visualization**: D3.js for graph rendering
- **Notifications**: Toastify-js for user feedback
- **Build**: Vite with HMR

## Module Structure

The dashboard follows a modular architecture with these patterns:

### Core Structure

```
dashboard/src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── modules/            # Feature modules (following template)
├── services/           # Business logic services
├── stores/             # Zustand state stores
└── types/              # TypeScript definitions
```

### Module Template Pattern

When creating new modules, follow the template structure:

- `components/`: UI components with single responsibility
- `hooks/`: Business logic hooks (useModule, useModuleValidation)
- `pages/`: Main page components
- `types/`: TypeScript interfaces
- `services/`: API integration services
- `contexts/`: React context providers

## Code Quality Standards

### File Organization

- Maximum 200 lines per file
- Single responsibility per component/hook
- Semantic naming reflecting business domain
- No inline comments (only docstrings in English)

### TypeScript Standards

- Strict typing enabled
- Interface definitions in dedicated type files
- Proper error handling with user feedback
- Consistent validation patterns

### Styling Standards

- Tailwind CSS utilities only
- Dark theme: bg-gray-900/800, text-white/gray-400
- Consistent spacing and typography
- Responsive design patterns

## Semantic Artifact Integration

### Artifact Types Supported

- **Foundational**: Purpose, Context, Authority, Evaluation
- **Strategic**: Vision, Policy, Principle, Guideline, Concept, Indicator
- **Operational**: Process, Procedure, Event, Result, Observation
- **Organizational**: Actor, Area

### Graph Visualization

- D3.js SVG-based rendering
- Interactive node creation and editing
- Drag-and-drop relationship creation
- @ mention autocomplete for semantic references
- Temporal artifact support with visual feedback

### Validation System

- Real-time validation with visual indicators
- Consistent error messaging
- Semantic reference validation
- Type-based validation rules

## Development Workflow

### Before Implementation

1. Check execution-context.md for current state
2. Read relevant template documentation
3. Identify semantic artifacts involved
4. Plan DDD bounded contexts

### During Implementation

1. Follow single responsibility principle
2. Use semantic naming conventions
3. Implement proper error handling
4. Maintain type safety

### After Implementation

1. Update execution-context.md
2. Document architectural decisions
3. Ensure code quality standards
4. Test semantic coherence

## Integration Points

### Event System

- Event bus for cross-component communication
- Artifact lifecycle events
- User interaction events
- Validation events

### State Management

- Zustand stores for global state
- Local component state for UI-specific data
- Temporal state for draft artifacts
- Validation state for form handling

### API Integration

- GraphQL for semantic queries (planned)
- OpenSearch for semantic search (planned)
- Local storage for persistence
- Export/import functionality

## Performance Considerations

### Optimization Strategies

- Component memoization for expensive renders
- Lazy loading for large modules
- Efficient D3.js updates
- Debounced validation

### Memory Management

- Proper cleanup of D3.js resources
- Event listener cleanup
- Temporal artifact cleanup
- Store subscription management

## Accessibility Standards

### Requirements

- Keyboard navigation support
- ARIA labels for screen readers
- Color contrast compliance
- Focus management
- Semantic HTML structure

### Implementation

- Tab order for graph interactions
- Keyboard shortcuts for common actions
- Screen reader announcements for state changes
- High contrast mode support

## Testing Strategy

### Unit Testing

- Component rendering tests
- Hook behavior tests
- Service integration tests
- Validation logic tests

### Integration Testing

- Graph interaction flows
- Artifact lifecycle tests
- Cross-component communication
- State management tests

### E2E Testing

- Complete user workflows
- Artifact creation and editing
- Graph visualization interactions
- Export/import functionality

This context should guide all development decisions and ensure consistency with the Hexy Framework's semantic principles.
