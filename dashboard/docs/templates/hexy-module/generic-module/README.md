# Generic Module Template

A reusable template for creating new modules in the Hexy Framework dashboard following semantic architecture principles.

## 🏗️ Architecture

This template follows Hexy Framework principles:

- **Semantic Artifacts**: Built around Purpose, Context, Authority, and Evaluation
- **DDD Patterns**: Domain-driven design with clear bounded contexts
- **Event-Driven**: Reactive architecture with event bus integration
- **Hexagonal Architecture**: Clean separation of concerns

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
class CustomModuleService extends ModuleService {
  async load(): Promise<ModuleData | null> {
    const response = await fetch('/api/your-endpoint')
    return response.json()
  }
}
```

### Event Integration

```tsx
import { useEventBus } from '../../../contexts/EventBusContext'

const { emit, subscribe } = useEventBus()

// Emit events
emit('module:updated', { moduleId, data })

// Subscribe to events
subscribe('artifact:created', handleArtifactCreated)
```

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

## 📚 Best Practices

1. **Semantic Naming**: Use domain-specific terminology
2. **Single Responsibility**: Each component has one clear purpose
3. **Error Handling**: Graceful degradation and user feedback
4. **Performance**: Lazy loading and memoization where appropriate
5. **Accessibility**: ARIA labels and keyboard navigation
6. **Type Safety**: Comprehensive TypeScript coverage

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