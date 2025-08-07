# Generic Module Template

A simplified, DRY-compliant template for creating new modules in the Hexy Framework dashboard following semantic architecture principles.

## 🏗️ Simplified Architecture

This template follows **DRY principles** and **semantic simplicity**:

- **Single Event System**: One global event bus, no duplication
- **Minimal Layers**: Direct service → component communication
- **Semantic Focus**: Built around Purpose, Context, Authority, and Evaluation
- **DDD Patterns**: Clear bounded contexts without over-abstraction
- **Performance First**: Minimal overhead, maximum efficiency

## 📁 Structure

```
generic-module/
├── components/          # React components
│   ├── ModuleContainer.tsx
│   ├── ModuleHeader.tsx
│   ├── ModuleContent.tsx
│   ├── ModuleFooter.tsx
│   ├── ModuleActions.tsx
│   └── index.tsx
├── hooks/              # Custom React hooks
│   ├── useModule.ts
│   ├── useModuleValidation.ts
│   └── index.ts
├── pages/              # Page components
│   └── index.tsx
├── types/              # TypeScript definitions
│   ├── Module.ts
│   └── index.ts
├── contexts/           # React contexts
│   └── ModuleContext.tsx
├── services/           # Business logic services
│   ├── ModuleService.ts
│   └── index.ts
├── index.ts            # Main exports
└── README.md           # This file
```

## 🚀 Usage

### 1. Copy the Template

```bash
cp -r dashboard/templates/generic-module dashboard/src/modules/your-module-name
```

### 2. Customize the Module

1. **Update component names**: Replace "Module" with your specific module name
2. **Configure types**: Modify `types/Module.ts` for your data structures
3. **Implement service**: Update `services/ModuleService.ts` with your API calls
4. **Add validation**: Customize validation rules in `hooks/useModuleValidation.ts`
5. **Style components**: Update Tailwind classes for your design

### 3. Integration

```tsx
import { ModulePage } from './modules/your-module-name'

const config = {
  title: 'Your Module',
  subtitle: 'Module description',
  version: '1.0.0',
  author: 'Your Name',
  description: 'Detailed description',
  settings: {
    autoSave: true,
    validateOnChange: true,
    showFooter: true,
    showActions: true
  }
}

<ModulePage config={config} />
```

## 🎯 Key Features

### Components
- **ModuleContainer**: Main wrapper with error handling and loading states
- **ModuleHeader**: Title, status, and action buttons
- **ModuleContent**: Main content area with empty state handling
- **ModuleFooter**: Statistics and status information
- **ModuleActions**: Save, refresh, export, and reset functionality

### Hooks
- **useModule**: Main business logic and data management
- **useModuleValidation**: Form validation with customizable rules

### Services
- **ModuleService**: API integration with CRUD operations
- Mock implementations for rapid prototyping
- Export/import functionality

### Context
- **ModuleContext**: Centralized state management
- Configuration and statistics sharing

## 🔧 Customization

### Adding Custom Validation

```tsx
const customRules: ValidationRule[] = [
  {
    field: 'email',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  }
]

const { validate } = useModuleValidation(customRules)
```

### Custom Service Implementation

```tsx
import { useEventBus } from '../../../contexts/EventBusContext'

// ✅ Simplified service with direct EventBus integration
class CustomModuleService extends ModuleService {
  constructor(config: ModuleConfig, eventBus: EventBus) {
    super(config, eventBus, '/api/your-endpoint')
  }

  async load(): Promise<ModuleData | null> {
    // Events are automatically emitted by parent class
    const response = await fetch('/api/your-endpoint')
    return response.json()
  }
}

// ✅ Usage in React component
const MyModuleComponent: React.FC = () => {
  const eventBus = useEventBus()
  const [data, setData] = useState<ModuleData | null>(null)
  const [loading, setLoading] = useState(false)

  const service = useMemo(() => 
    new CustomModuleService({ name: 'my-module', version: '1.0.0' }, eventBus),
    [eventBus]
  )

  useEffect(() => {
    // ✅ Direct event subscription - no intermediate layers
    const unsubscribeLoad = eventBus.subscribe('module:loaded', ({ data }) => {
      if (data.source === 'my-module') {
        setData(data.data)
        setLoading(false)
      }
    })

    const unsubscribeError = eventBus.subscribe('module:load:failed', ({ data }) => {
      if (data.source === 'my-module') {
        setLoading(false)
        // Handle error
      }
    })

    return () => {
      unsubscribeLoad()
      unsubscribeError()
    }
  }, [eventBus])

  const handleLoad = async () => {
    setLoading(true)
    await service.load() // Events emitted automatically
  }

  return (
    <div>
      {loading ? 'Loading...' : data?.name}
      <button onClick={handleLoad}>Load Data</button>
    </div>
  )
}
```

### Simplified Event Integration

```tsx
import { useEventBus } from '../../../contexts/EventBusContext'

const eventBus = useEventBus()

// ✅ Single event system - no duplication
eventBus.publish('module:data:updated', { 
  source: 'your-module',
  moduleId, 
  data,
  timestamp: Date.now()
})

// ✅ Direct subscription - no intermediate layers
eventBus.subscribe('artifact:created', ({ data }) => {
  // React directly to events
  handleArtifactCreated(data.artifact)
})

// ✅ Semantic event naming
eventBus.publish('module:validation:completed', {
  source: 'your-module',
  isValid: true,
  errors: []
})
```

### Event Naming Convention

Follow this **DRY-compliant** naming pattern:

```
{domain}:{entity}:{action}
```

Examples:
- `artifact:item:created`
- `module:validation:failed` 
- `user:session:expired`
- `system:backup:completed`

## 🎨 Styling

The template uses Tailwind CSS with a dark theme:

- **Background**: `bg-gray-900` (main), `bg-gray-800` (cards)
- **Text**: `text-white` (primary), `text-gray-400` (secondary)
- **Borders**: `border-gray-700`
- **Actions**: Blue for primary, green for success, red for danger

### Custom Styling

```tsx
<ModuleContainer className="custom-module-styles">
  {/* Your content */}
</ModuleContainer>
```

## 🧪 Testing

The template is designed to be easily testable:

```tsx
import { render, screen } from '@testing-library/react'
import { ModulePage } from './index'

test('renders module page', () => {
  render(<ModulePage />)
  expect(screen.getByText('Generic Module')).toBeInTheDocument()
})
```

## � Aenti-Patterns to Avoid (DRY Violations)

### ❌ **Don't Create Duplicate Event Systems**
```tsx
// ❌ BAD: Double event handling
class ModuleService extends EventEmitter {
  create(data) {
    this.emit('item:created', data)  // Local event
    eventBus.publish('module:item:created', data)  // Global event
  }
}

// ✅ GOOD: Single event system
class ModuleService {
  create(data) {
    eventBus.publish('module:item:created', { 
      source: 'module-name',
      data,
      timestamp: Date.now()
    })
  }
}
```

### ❌ **Don't Create Unnecessary Abstraction Layers**
```tsx
// ❌ BAD: Over-abstraction
class EventBusIntegration {
  constructor(eventBus, moduleService) {
    this.setupEventHandlers()  // Unnecessary layer
  }
}

// ✅ GOOD: Direct integration
const moduleService = new ModuleService()
moduleService.onCreate = (data) => {
  eventBus.publish('module:item:created', data)
}
```

### ❌ **Don't Duplicate State Management**
```tsx
// ❌ BAD: Multiple state sources
const [localState, setLocalState] = useState()
const globalState = useGlobalStore()
const contextState = useModuleContext()

// ✅ GOOD: Single source of truth
const { state, actions } = useModule()
```

## 📚 DRY-Compliant Best Practices

1. **Single Event System**: Use only the global EventBus, no local emitters
2. **Direct Communication**: Service → EventBus → Component (no middleware)
3. **Semantic Naming**: Use domain-specific terminology consistently
4. **Single State Source**: One store per domain, avoid duplication
5. **Minimal Abstractions**: Only abstract when you have 3+ similar implementations
6. **Performance First**: Measure before optimizing, avoid premature abstraction
7. **Type Safety**: Comprehensive TypeScript coverage without over-engineering

## 🔗 Integration with Hexy Framework

- **Artifacts**: Integrate with artifact store for semantic data
- **Events**: Use event bus for cross-module communication
- **Validation**: Follow Hexy validation patterns
- **Services**: Connect to Hexy backend services

## 📝 Next Steps

1. Copy and rename the template
2. Update the module configuration
3. Implement your specific business logic
4. Add custom validation rules
5. Style according to your design system
6. Write tests for your components
7. Document your module's API

---

**Note**: This template provides a solid foundation but should be customized for your specific use case. Follow Hexy Framework principles and maintain consistency with the overall dashboard architecture.