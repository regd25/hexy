# Plan de Implementación - Funcionalidades Críticas

## 🎯 Objetivo

Implementar las funcionalidades críticas pendientes en la versión React del dashboard, priorizando las características más importantes para tener un dashboard funcional.

## 📋 Prioridades de Implementación

### **Prioridad 1: Editor de Artefactos** 🔥 CRÍTICO

- **Tiempo estimado**: 2-3 semanas
- **Impacto**: Alto - Core del dashboard
- **Dependencias**: Ninguna

### **Prioridad 2: Grafo Interactivo** 🔥 CRÍTICO

- **Tiempo estimado**: 3-4 semanas
- **Impacto**: Alto - Visualización principal
- **Dependencias**: Editor de artefactos

### **Prioridad 3: Gestión de Datos** ⚡ IMPORTANTE

- **Tiempo estimado**: 1-2 semanas
- **Impacto**: Medio - Funcionalidad básica
- **Dependencias**: Editor y grafo

### **Prioridad 4: UI/UX Moderna** 📱 MEJORA

- **Tiempo estimado**: 2-3 semanas
- **Impacto**: Bajo - Mejoras visuales
- **Dependencias**: Todas las anteriores

## 🚀 Fase 1: Editor de Artefactos

### **1.1 Componente Editor Básico**

```typescript
// src/components/editor/ArtifactEditor.tsx
interface ArtifactEditorProps {
  artifact?: Artifact
  onSave: (artifact: Artifact) => void
  onCancel: () => void
}

export const ArtifactEditor: React.FC<ArtifactEditorProps> = ({
  artifact,
  onSave,
  onCancel
}) => {
  const [content, setContent] = useState(artifact?.description || '')
  const [name, setName] = useState(artifact?.name || '')
  const [type, setType] = useState<ArtifactType>(artifact?.type || 'concept')

  return (
    <div className="artifact-editor">
      <div className="editor-header">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del artefacto"
          className="name-input"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ArtifactType)}
          className="type-select"
        >
          {ARTIFACT_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Descripción del artefacto..."
        className="content-textarea"
      />

      <div className="editor-actions">
        <button onClick={() => onSave({ id: artifact?.id || generateId(), name, type, description: content })}>
          Guardar
        </button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}
```

### **1.2 Autocompletado con @**

```typescript
// src/components/editor/AutocompleteDropdown.tsx
interface AutocompleteDropdownProps {
  query: string
  artifacts: Artifact[]
  onSelect: (artifact: Artifact) => void
  position: { x: number; y: number }
}

export const AutocompleteDropdown: React.FC<AutocompleteDropdownProps> = ({
  query,
  artifacts,
  onSelect,
  position
}) => {
  const filteredArtifacts = artifacts.filter(artifact =>
    artifact.name.toLowerCase().includes(query.toLowerCase()) ||
    artifact.id.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      className="autocomplete-dropdown"
      style={{ left: position.x, top: position.y }}
    >
      {filteredArtifacts.map(artifact => (
        <div
          key={artifact.id}
          className="autocomplete-item"
          onClick={() => onSelect(artifact)}
        >
          <span className="artifact-name">{artifact.name}</span>
          <span className="artifact-type">{artifact.type}</span>
        </div>
      ))}
    </div>
  )
}
```

### **1.3 Integración en Textarea**

```typescript
// src/hooks/useAutocomplete.ts
export const useAutocomplete = (artifacts: Artifact[]) => {
    const [showAutocomplete, setShowAutocomplete] = useState(false)
    const [query, setQuery] = useState('')
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        const cursorPos = e.target.selectionStart

        // Detectar @ para autocompletado
        const beforeCursor = value.slice(0, cursorPos)
        const match = beforeCursor.match(/@(\w*)$/)

        if (match) {
            setQuery(match[1])
            setShowAutocomplete(true)

            // Calcular posición del dropdown
            const rect = e.target.getBoundingClientRect()
            const lineHeight = 20
            const lines = beforeCursor.split('\n').length
            setPosition({
                x: rect.left + match[0].length * 8,
                y: rect.top + lines * lineHeight,
            })
        } else {
            setShowAutocomplete(false)
        }
    }

    const insertReference = (artifact: Artifact, textarea: HTMLTextAreaElement) => {
        const value = textarea.value
        const cursorPos = textarea.selectionStart
        const beforeAt = value.slice(0, value.lastIndexOf('@'))
        const afterAt = value.slice(cursorPos)

        const newValue = beforeAt + `@${artifact.id} ` + afterAt
        return newValue
    }

    return {
        showAutocomplete,
        query,
        position,
        handleInput,
        insertReference,
        hideAutocomplete: () => setShowAutocomplete(false),
    }
}
```

## 🚀 Fase 2: Grafo Interactivo

### **2.1 Integración con D3.js**

```typescript
// src/components/graph/D3Graph.tsx
import * as d3 from 'd3'

interface D3GraphProps {
  artifacts: Artifact[]
  onNodeClick: (artifact: Artifact) => void
  onNodeDrag: (artifact: Artifact, x: number, y: number) => void
}

export const D3Graph: React.FC<D3GraphProps> = ({
  artifacts,
  onNodeClick,
  onNodeDrag
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || artifacts.length === 0) return

    const svg = d3.select(svgRef.current)
    const width = 800
    const height = 600

    // Limpiar SVG
    svg.selectAll('*').remove()

    // Crear simulación de fuerzas
    const simulation = d3.forceSimulation(artifacts)
      .force('link', d3.forceLink().id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Crear enlaces (relaciones entre artefactos)
    const links = svg.append('g')
      .selectAll('line')
      .data([]) // TODO: Implementar relaciones
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2)

    // Crear nodos
    const nodes = svg.append('g')
      .selectAll('g')
      .data(artifacts)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // Agregar círculos a los nodos
    nodes.append('circle')
      .attr('r', 20)
      .attr('fill', (d: Artifact) => getArtifactColor(d.type))
      .on('click', (event, d) => onNodeClick(d))

    // Agregar texto a los nodos
    nodes.append('text')
      .text((d: Artifact) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', 'white')
      .style('font-size', '12px')

    // Actualizar posiciones en cada tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      nodes
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
      onNodeDrag(d, event.x, event.y)
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [artifacts, onNodeClick, onNodeDrag])

  return <svg ref={svgRef} width="800" height="600" />
}
```

### **2.2 Gestión de Relaciones**

```typescript
// src/types/Relationship.ts
export interface Relationship {
    id: string
    sourceId: string
    targetId: string
    type: 'uses' | 'depends_on' | 'implements' | 'extends' | 'custom'
    label?: string
    description?: string
}

// src/stores/relationshipStore.ts
interface RelationshipStore {
    relationships: Relationship[]
    addRelationship: (relationship: Relationship) => void
    removeRelationship: (id: string) => void
    getRelationshipsForArtifact: (artifactId: string) => Relationship[]
}

export const useRelationshipStore = create<RelationshipStore>((set, get) => ({
    relationships: [],

    addRelationship: relationship =>
        set(state => ({
            relationships: [...state.relationships, relationship],
        })),

    removeRelationship: id =>
        set(state => ({
            relationships: state.relationships.filter(r => r.id !== id),
        })),

    getRelationshipsForArtifact: artifactId => {
        const state = get()
        return state.relationships.filter(r => r.sourceId === artifactId || r.targetId === artifactId)
    },
}))
```

## 🚀 Fase 3: Gestión de Datos

### **3.1 Persistencia Local**

```typescript
// src/services/StorageService.ts
export class StorageService {
    private static STORAGE_KEY = 'hexy-artifacts'

    static saveArtifacts(artifacts: Artifact[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(artifacts))
        } catch (error) {
            console.error('Error saving artifacts:', error)
        }
    }

    static loadArtifacts(): Artifact[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY)
            return stored ? JSON.parse(stored) : []
        } catch (error) {
            console.error('Error loading artifacts:', error)
            return []
        }
    }

    static exportData(): string {
        const artifacts = this.loadArtifacts()
        return JSON.stringify(artifacts, null, 2)
    }

    static importData(data: string): Artifact[] {
        try {
            const artifacts = JSON.parse(data)
            this.saveArtifacts(artifacts)
            return artifacts
        } catch (error) {
            console.error('Error importing data:', error)
            throw new Error('Invalid data format')
        }
    }
}
```

### **3.2 Integración con Zustand**

```typescript
// src/stores/artifactStore.ts (actualizado)
export const useArtifactStore = create<ArtifactStore>((set, get) => ({
    // ... estado existente ...

    // Cargar artefactos al inicializar
    loadFromStorage: () => {
        const artifacts = StorageService.loadArtifacts()
        set({ artifacts })
    },

    // Guardar automáticamente al cambiar
    addArtifact: artifact =>
        set(state => {
            const newArtifacts = [...state.artifacts, artifact]
            StorageService.saveArtifacts(newArtifacts)
            return { artifacts: newArtifacts }
        }),

    updateArtifact: (id, updates) =>
        set(state => {
            const updatedArtifacts = state.artifacts.map(a => (a.id === id ? { ...a, ...updates } : a))
            StorageService.saveArtifacts(updatedArtifacts)
            return { artifacts: updatedArtifacts }
        }),

    deleteArtifact: id =>
        set(state => {
            const filteredArtifacts = state.artifacts.filter(a => a.id !== id)
            StorageService.saveArtifacts(filteredArtifacts)
            return { artifacts: filteredArtifacts }
        }),
}))
```

## 🚀 Fase 4: UI/UX Moderna

### **4.1 Setup shadcn/ui**

```bash
# Instalar shadcn/ui
npx shadcn-ui@latest init

# Instalar componentes necesarios
npx shadcn-ui@latest add button card input select toast dialog
npx shadcn-ui@latest add dropdown-menu context-menu
npx shadcn-ui@latest add tooltip badge
```

### **4.2 Componentes Modernos**

```typescript
// src/components/ui/ArtifactCard.tsx
import { Card, CardHeader, CardContent, CardActions } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ArtifactCardProps {
  artifact: Artifact
  onEdit: () => void
  onDelete: () => void
  onSelect: () => void
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onEdit,
  onDelete,
  onSelect
}) => {
  return (
    <Card className="artifact-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{artifact.name}</h3>
          <Badge variant="secondary">{artifact.type}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">
          {artifact.description}
        </p>
      </CardContent>

      <CardActions>
        <Button size="sm" onClick={onSelect}>Ver</Button>
        <Button size="sm" variant="outline" onClick={onEdit}>Editar</Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>Eliminar</Button>
      </CardActions>
    </Card>
  )
}
```

## 📅 Cronograma de Implementación

### **Semana 1-2: Editor de Artefactos**

- [ ] Componente Editor básico
- [ ] Autocompletado con @
- [ ] Validación de tipos
- [ ] Integración con Zustand

### **Semana 3-4: Grafo Interactivo**

- [ ] Integración D3.js
- [ ] Nodos arrastrables
- [ ] Sistema de relaciones
- [ ] Zoom y pan

### **Semana 5: Gestión de Datos**

- [ ] Persistencia local
- [ ] Exportación/importación
- [ ] CRUD completo
- [ ] Validaciones

### **Semana 6-7: UI/UX Moderna**

- [ ] shadcn/ui setup
- [ ] Componentes modernos
- [ ] Animaciones
- [ ] Responsive design

## 🎯 Criterios de Éxito

### **Editor de Artefactos**

- ✅ Autocompletado @ funcional
- ✅ Validación de tipos
- ✅ Guardado automático
- ✅ Navegación por teclado

### **Grafo Interactivo**

- ✅ Nodos arrastrables
- ✅ Creación de relaciones
- ✅ Zoom y pan
- ✅ Visualización por tipos

### **Gestión de Datos**

- ✅ Persistencia local
- ✅ Exportación JSON
- ✅ Importación JSON
- ✅ CRUD completo

### **UI/UX Moderna**

- ✅ Componentes accesibles
- ✅ Responsive design
- ✅ Animaciones fluidas
- ✅ Temas consistentes

## 🚨 Riesgos y Mitigación

### **Riesgo: Complejidad D3.js**

**Mitigación**: Empezar con implementación básica, iterar gradualmente

### **Riesgo: Performance con muchos artefactos**

**Mitigación**: Implementar virtualización y lazy loading

### **Riesgo: Compatibilidad de navegadores**

**Mitigación**: Testing en múltiples navegadores, polyfills si es necesario

### **Riesgo: Pérdida de datos**

**Mitigación**: Backup automático, validación de datos, confirmaciones

---

Este plan proporciona una guía detallada para implementar las funcionalidades críticas pendientes en la versión React del dashboard, priorizando las características más importantes para tener un dashboard funcional.
