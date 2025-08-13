# Artifacts Module - Simplified Architecture

## 🚫 **Current Problems (Over-Engineering)**

1. **Duplicate Event Systems**:
    - `ArtifactService.emit()` (local events)
    - `EventBusIntegration.emitGlobalEvent()` (global events)
    - Same information, different formats

2. **Unnecessary Abstraction Layers**:
    - `EventBusIntegration` class as middleware
    - `ArtifactEvents` vs `GlobalArtifactEvents` interfaces
    - Complex event transformation logic

3. **State Duplication**:
    - Repository state
    - Service state
    - Component state
    - Store state

## ✅ **Simplified Architecture (DRY Compliant)**

### **Single Event System**

```typescript
// ❌ BEFORE: Dual event system
class ArtifactService extends EventEmitter {
    async createArtifact(payload) {
        const artifact = await this.repository.create(payload)
        this.emit('artifact:created', { artifact }) // Local
        return artifact
    }
}

class EventBusIntegration {
    setupArtifactEventHandlers() {
        this.artifactService.on('artifact:created', ({ artifact }) => {
            this.emitGlobalEvent('artifacts:artifact:created', { artifact }) // Global
        })
    }
}

// ✅ AFTER: Single event system
class ArtifactService {
    constructor(eventBus, repository) {
        this.eventBus = eventBus
        this.repository = repository
    }

    async createArtifact(payload) {
        const artifact = await this.repository.create(payload)

        // Single event emission
        this.eventBus.publish('artifact:created', {
            source: 'artifacts-module',
            artifact,
            timestamp: Date.now(),
        })

        return artifact
    }
}
```

### **Direct Service Integration**

```typescript
// ✅ Simplified service with direct event bus integration
export class SimplifiedArtifactService {
    constructor(
        private eventBus: EventBus,
        private repository: IArtifactRepository,
        private validator: ValidationService
    ) {}

    async createArtifact(payload: CreateArtifactPayload): Promise<Artifact> {
        // Validate
        const validationResult = await this.validator.validatePayload(payload)
        if (!validationResult.isValid) {
            this.eventBus.publish('artifact:validation:failed', {
                source: 'artifacts-module',
                errors: validationResult.errors,
                payload,
            })
            throw new Error('Validation failed')
        }

        // Create
        const artifact = await this.repository.create(payload)

        // Single event - no duplication
        this.eventBus.publish('artifact:created', {
            source: 'artifacts-module',
            artifact,
            timestamp: Date.now(),
        })

        // Auto-validate new artifact
        this.validateArtifactAsync(artifact)

        return artifact
    }

    private async validateArtifactAsync(artifact: Artifact) {
        try {
            const result = await this.validator.validateArtifact(artifact)

            this.eventBus.publish('artifact:validated', {
                source: 'artifacts-module',
                artifact,
                result,
                timestamp: Date.now(),
            })
        } catch (error) {
            this.eventBus.publish('artifact:validation:error', {
                source: 'artifacts-module',
                artifactId: artifact.id,
                error: error.message,
            })
        }
    }
}
```

### **Simplified Component Integration**

```typescript
// ✅ Direct event bus usage in components
export const ArtifactEditor: React.FC = () => {
  const eventBus = useEventBus()
  const [artifact, setArtifact] = useState<Artifact | null>(null)

  useEffect(() => {
    // Direct subscription - no intermediate layers
    const unsubscribe = eventBus.subscribe('artifact:created', ({ data }) => {
      if (data.source === 'artifacts-module') {
        setArtifact(data.artifact)
        showNotification('Artifact created successfully!')
      }
    })

    return unsubscribe
  }, [eventBus])

  const handleSave = async (payload: CreateArtifactPayload) => {
    // Direct service call
    await artifactService.createArtifact(payload)
    // Event will be emitted automatically by service
  }

  return (
    <form onSubmit={handleSave}>
      {/* Form fields */}
    </form>
  )
}
```

## 🎯 **Event Naming Convention (DRY)**

### **Consistent Pattern**: `{domain}:{entity}:{action}`

```typescript
// ✅ Artifacts domain events
'artifact:created'
'artifact:updated'
'artifact:deleted'
'artifact:validated'
'artifact:validation:failed'

// ✅ Temporal artifacts
'temporal-artifact:created'
'temporal-artifact:promoted'
'temporal-artifact:deleted'

// ✅ Relationships
'relationship:created'
'relationship:deleted'

// ✅ System events
'system:backup:created'
'system:integrity:checked'
```

## 🚀 **Benefits of Simplified Architecture**

1. **50% Less Code**: Eliminated EventBusIntegration layer
2. **Single Source of Truth**: One event system
3. **Better Performance**: No event transformation overhead
4. **Easier Testing**: Direct dependencies, no complex mocking
5. **Clearer Flow**: Service → EventBus → Component
6. **DRY Compliant**: No duplicate event handling

## 📊 **Migration Plan**

### Phase 1: Simplify Event System

1. Remove `EventBusIntegration` class
2. Update `ArtifactService` to use EventBus directly
3. Standardize event naming convention

### Phase 2: Update Components

1. Remove local event listeners
2. Subscribe directly to EventBus
3. Simplify state management

### Phase 3: Clean Up

1. Remove unused interfaces (`ArtifactEvents`, `GlobalArtifactEvents`)
2. Update tests to reflect simplified architecture
3. Update documentation

## 🧪 **Testing Simplified Architecture**

```typescript
// ✅ Much simpler testing
describe('SimplifiedArtifactService', () => {
    let service: SimplifiedArtifactService
    let mockEventBus: jest.Mocked<EventBus>
    let mockRepository: jest.Mocked<IArtifactRepository>

    beforeEach(() => {
        mockEventBus = createMockEventBus()
        mockRepository = createMockRepository()
        service = new SimplifiedArtifactService(mockEventBus, mockRepository, mockValidator)
    })

    test('should emit single event when creating artifact', async () => {
        const payload = createMockPayload()
        const artifact = await service.createArtifact(payload)

        expect(mockEventBus.publish).toHaveBeenCalledWith('artifact:created', {
            source: 'artifacts-module',
            artifact,
            timestamp: expect.any(Number),
        })
    })
})
```

This simplified architecture eliminates over-engineering while maintaining all functionality with better performance and maintainability.
