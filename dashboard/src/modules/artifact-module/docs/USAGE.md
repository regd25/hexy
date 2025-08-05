# Artifact Module Usage Guide

## Overview

The Artifact Module provides comprehensive artifact management functionality for the Hexy Framework, following Domain-Driven Design principles and hexagonal architecture patterns.

## Quick Start

### Basic Usage

```typescript
import { useArtifacts, ArtifactService, ValidationService } from '../modules/artifact-module';

// Initialize services
const artifactService = new ArtifactService();
const validationService = new ValidationService();

// Use the hook
const {
  artifacts,
  createArtifact,
  updateArtifact,
  deleteArtifact,
  validateArtifact,
  // ... other actions
} = useArtifacts(artifactService, validationService);
```

### Creating Artifacts

```typescript
// Create a new purpose artifact
const purpose = await createArtifact('PURPOSE', {
  name: 'Customer Satisfaction Vision',
  description: 'Our vision for exceptional customer experience',
  purpose: 'Define the strategic direction for customer satisfaction initiatives',
  context: 'Applicable to all customer-facing teams and processes',
  authority: 'Customer Experience Committee',
  evaluation: 'Measured by NPS scores above 70 and customer retention above 85%',
  tags: ['strategy', 'customer', 'vision']
});

// Create a policy artifact
const policy = await createArtifact('POLICY', {
  name: 'Data Privacy Policy',
  description: 'Guidelines for handling customer data',
  purpose: 'Ensure compliance with GDPR and protect customer privacy',
  context: 'Applies to all data processing activities',
  authority: 'Data Protection Officer',
  evaluation: 'Annual compliance audit score above 95%',
  temporalData: {
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    version: '2.0'
  }
});
```

### Managing Relationships

```typescript
// Add relationships between artifacts
await addRelationship({
  sourceId: 'purpose-id',
  targetId: 'policy-id',
  type: 'IMPLEMENTS',
  description: 'This policy implements the customer satisfaction vision'
});

// Get connected artifacts
const connected = getConnectedArtifacts('purpose-id');
console.log('Related artifacts:', connected);
```

### Filtering and Searching

```typescript
// Set up filters
setFilter({
  type: 'POLICY',
  tags: ['gdpr', 'privacy']
});

// Search artifacts
setSearchTerm('customer');

// Sort results
setSortBy('name');
setSortOrder('asc');

// Use filtered and sorted results
console.log('Filtered artifacts:', filteredArtifacts);
console.log('Sorted artifacts:', sortedArtifacts);
```

### Validation

```typescript
// Validate single artifact
const validation = await validateArtifact(artifact);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}

// Validate all artifacts
await validateAll();
console.log('All validation results:', validationResults);
```

## Component Integration

### Using ArtifactDashboard

```typescript
import { ArtifactDashboard } from '../modules/artifact-module';

// In your router configuration
{
  path: '/artifacts',
  element: <ArtifactDashboard />
}
```

### Using Individual Components

```typescript
import { ArtifactEditor, ArtifactGraph, ArtifactList } from '../modules/artifact-module';

// Artifact editor
<ArtifactEditor
  artifactId="artifact-id"
  mode="edit"
  onSave={handleSave}
  onCancel={handleCancel}
/>

// Artifact graph
<ArtifactGraph
  artifacts={artifacts}
  selectedId="selected-id"
  onNodeClick={handleNodeClick}
  onNodeHover={handleNodeHover}
/>

// Artifact list
<ArtifactList
  artifacts={artifacts}
  selectedId="selected-id"
  onArtifactSelect={handleSelect}
  onArtifactEdit={handleEdit}
  onArtifactDelete={handleDelete}
/>
```

## Advanced Usage

### Custom Validation Rules

```typescript
// Extend validation service
class CustomValidationService extends ValidationService {
  async validateCustomRule(artifact: Artifact): Promise<ValidationResult> {
    // Add custom validation logic
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  }
}

const validationService = new CustomValidationService();
```

### Custom Storage

```typescript
// Implement custom repository
class CustomArtifactRepository implements ArtifactRepository {
  async save(artifact: Artifact): Promise<Artifact> {
    // Custom storage logic
    return artifact;
  }

  async findById(id: string): Promise<Artifact | null> {
    // Custom retrieval logic
    return null;
  }

  async findAll(): Promise<Artifact[]> {
    // Custom listing logic
    return [];
  }

  async delete(id: string): Promise<boolean> {
    // Custom deletion logic
    return true;
  }
}
```

### Event Handling

```typescript
// Listen to artifact events
artifactService.on('ARTIFACT_CREATED', (artifact) => {
  console.log('New artifact created:', artifact);
});

artifactService.on('ARTIFACT_UPDATED', (artifact) => {
  console.log('Artifact updated:', artifact);
});

artifactService.on('ARTIFACT_DELETED', (id) => {
  console.log('Artifact deleted:', id);
});
```

## Best Practices

### 1. Naming Conventions

- Use descriptive names for artifacts
- Follow consistent naming patterns
- Include version numbers in temporal artifacts

```typescript
// Good
name: 'CustomerOnboardingProcess_v2.1'
name: 'GDPR_Compliance_Policy_2024'

// Avoid
name: 'Policy1'
name: 'New Process'
```

### 2. Context Definition

- Be specific about context boundaries
- Include temporal context when relevant
- Define clear authority sources

```typescript
context: 'Applies to all EU-based customer data processing activities',
authority: 'Chief Data Officer, approved by Board on 2024-03-15'
```

### 3. Evaluation Criteria

- Use measurable metrics
- Include timeframes for evaluation
- Define success criteria clearly

```typescript
evaluation: 'Achieve 95% customer satisfaction score within 6 months, measured quarterly'
```

### 4. Tag Management

- Use consistent tag taxonomy
- Include domain-specific tags
- Maintain tag documentation

```typescript
tags: ['customer-experience', 'strategy', '2024-goals', 'eu-region']
```

## Performance Optimization

### Large Datasets

```typescript
// Implement pagination
const { paginatedArtifacts, totalPages } = usePagination(artifacts, 50);

// Use virtual scrolling for lists
<ArtifactList
  artifacts={artifacts}
  virtualScroll={true}
  itemHeight={60}
/>
```

### Caching Strategies

```typescript
// Implement caching layer
class CachedArtifactService extends ArtifactService {
  private cache = new Map<string, Artifact>();
  
  async getArtifact(id: string): Promise<Artifact | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    
    const artifact = await super.getArtifact(id);
    if (artifact) {
      this.cache.set(id, artifact);
    }
    
    return artifact;
  }
}
```

## Troubleshooting

### Common Issues

1. **Validation Errors**
   - Check required fields
   - Verify date formats
   - Ensure authority sources are valid

2. **Storage Issues**
   - Check localStorage availability
   - Verify storage quotas
   - Handle storage failures gracefully

3. **Performance Issues**
   - Implement lazy loading
   - Use pagination for large datasets
   - Optimize relationship queries

### Debug Mode

```typescript
// Enable debug logging
const service = new ArtifactService({ debug: true });

// Monitor performance
console.time('artifact-load');
await loadArtifacts();
console.timeEnd('artifact-load');
```

## Migration Guide

### From Legacy System

```typescript
// Migrate legacy artifacts
const migrateLegacyArtifact = (legacy: any): Artifact => {
  return {
    id: legacy.id || generateId(),
    name: legacy.title || legacy.name,
    type: mapLegacyType(legacy.type),
    description: legacy.description || '',
    purpose: legacy.purpose || legacy.objective,
    context: legacy.context || 'Not specified',
    authority: legacy.owner || 'Unknown',
    evaluation: legacy.metrics || 'Not defined',
    tags: legacy.tags || [],
    createdAt: new Date(legacy.created || Date.now()),
    updatedAt: new Date(legacy.updated || Date.now()),
    temporalData: legacy.validity ? {
      validFrom: new Date(legacy.validity.start),
      validTo: new Date(legacy.validity.end),
      version: legacy.version || '1.0'
    } : undefined
  };
};
```

## API Reference

### ArtifactService Methods

- `createArtifact(type, data)`: Create new artifact
- `getArtifact(id)`: Retrieve artifact by ID
- `getAllArtifacts()`: Get all artifacts
- `getArtifactsByType(type)`: Get artifacts filtered by type
- `updateArtifact(id, data)`: Update existing artifact
- `deleteArtifact(id)`: Delete artifact

### useArtifacts Hook

- `artifacts`: Array of all artifacts
- `filteredArtifacts`: Filtered artifacts based on current filters
- `sortedArtifacts`: Sorted artifacts
- `selectedArtifact`: Currently selected artifact
- `validationResults`: Validation results for all artifacts
- `createArtifact(type, data)`: Create new artifact
- `updateArtifact(id, data)`: Update artifact
- `deleteArtifact(id)`: Delete artifact
- `selectArtifact(id)`: Select artifact
- `validateArtifact(artifact)`: Validate single artifact
- `validateAll()`: Validate all artifacts
- `setFilter(filter)`: Set filter criteria
- `setSearchTerm(term)`: Set search term
- `setSortBy(field)`: Set sort field
- `setSortOrder(order)`: Set sort order
- `undo()`: Undo last action
- `redo()`: Redo last undone action
- `addRelationship(relationship)`: Add relationship
- `removeRelationship(sourceId, targetId)`: Remove relationship
- `getConnectedArtifacts(id)`: Get connected artifacts
- `findPath(fromId, toId)`: Find path between artifacts