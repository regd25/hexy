# Roadmap de Migración a React - Dashboard Hexy

## 🎯 Objetivo

Migrar el dashboard actual de Vanilla JavaScript a React + TypeScript siguiendo los principios del **Manifiesto de Arquitectura de Hexy** y el stack de frontend moderno.

## 📋 Stack de Frontend Objetivo

### **Framework y Herramientas**
- **React 18** + **TypeScript** (strict mode) ✅
- **Vite** (ya configurado) con HMR ✅
- **Tailwind CSS** (ya configurado) ✅

### **Librerías de UI y Componentes**
- **shadcn/ui** - Componentes accesibles y reutilizables ⏳
- **lucide-react** - Iconos consistentes ⏳
- **Framer Motion** - Animaciones fluidas ⏳

### **Canvas y Gráficos**
- **react-konva** - Renderizado de alto rendimiento para el grafo ⏳
- **Konva.js** - Canvas 2D optimizado ⏳

### **Gestión de Estado**
- **Zustand** - Estado global ligero y basado en hooks ✅
- **React Query** - Gestión de estado del servidor (futuro) ⏳

### **Editor WYSIWYG**
- **Textarea con autocompletado** `@` para referencias semánticas ⏳
- **Resaltado de sintaxis** para artefactos ⏳
- **Atajos de teclado** para navegación ⏳

## 🚀 Fases de Migración

### **Fase 1: Setup React + TypeScript** (Semana 1) ✅ COMPLETADA

#### **1.1 Configuración Inicial** ✅
```bash
# Instalar dependencias React
npm install react react-dom @types/react @types/react-dom
npm install -D @vitejs/plugin-react

# Configurar TypeScript
npm install -D typescript @types/node
```

#### **1.2 Configurar Vite para React** ✅
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Configuración existente...
})
```

#### **1.3 Setup TypeScript** ✅
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### **Fase 2: Migrar Componentes Core** (Semanas 2-3) 🔄 EN PROGRESO

#### **2.1 Estructura de Componentes React** ✅
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── graph/           # GraphContainer, NodeRenderer, LinkRenderer ✅
│   ├── navigator/       # NavigatorContainer, SearchComponent ✅
│   ├── navbar/          # NavbarContainer, LogoComponent ✅
│   ├── editor/          # Editor WYSIWYG
│   └── layout/          # Layout components ✅
├── hooks/               # Custom hooks ✅
├── stores/              # Zustand stores ✅
├── services/            # ArtifactService, GraphService
├── types/               # TypeScript types ✅
└── utils/               # Utilities
```

#### **2.2 Migrar EventBus a React Context** ✅
```typescript
// src/contexts/EventBusContext.tsx
import React, { createContext, useContext } from 'react'
import { EventBus } from '../services/EventBus'

const EventBusContext = createContext<EventBus | null>(null)

export const EventBusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const eventBus = new EventBus()
  
  return (
    <EventBusContext.Provider value={eventBus}>
      {children}
    </EventBusContext.Provider>
  )
}

export const useEventBus = () => {
  const context = useContext(EventBusContext)
  if (!context) {
    throw new Error('useEventBus must be used within EventBusProvider')
  }
  return context
}
```

#### **2.3 Migrar NotificationManager a React Hook** ✅
```typescript
// src/hooks/useNotifications.ts
import { useCallback } from 'react'
import { useEventBus } from '../contexts/EventBusContext'
import { NotificationManager } from '../services/NotificationManager'

export const useNotifications = () => {
  const eventBus = useEventBus()
  const notificationManager = new NotificationManager(eventBus)
  
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    notificationManager.show(message, type)
  }, [notificationManager])
  
  return { showNotification }
}
```

### **Fase 3: Implementar Stack Moderno** (Semanas 4-5) ⏳ PENDIENTE

#### **3.1 Setup shadcn/ui** ⏳
```bash
# Instalar shadcn/ui
npx shadcn-ui@latest init

# Instalar componentes necesarios
npx shadcn-ui@latest add button card input select toast
```

#### **3.2 Setup Zustand para Estado Global** ✅
```typescript
// src/stores/artifactStore.ts
import { create } from 'zustand'
import { Artifact } from '../types/Artifact'

interface ArtifactStore {
  artifacts: Artifact[]
  selectedArtifact: Artifact | null
  addArtifact: (artifact: Artifact) => void
  updateArtifact: (id: string, updates: Partial<Artifact>) => void
  deleteArtifact: (id: string) => void
  selectArtifact: (artifact: Artifact | null) => void
}

export const useArtifactStore = create<ArtifactStore>((set) => ({
  artifacts: [],
  selectedArtifact: null,
  addArtifact: (artifact) => set((state) => ({ 
    artifacts: [...state.artifacts, artifact] 
  })),
  updateArtifact: (id, updates) => set((state) => ({
    artifacts: state.artifacts.map(a => 
      a.id === id ? { ...a, ...updates } : a
    )
  })),
  deleteArtifact: (id) => set((state) => ({
    artifacts: state.artifacts.filter(a => a.id !== id)
  })),
  selectArtifact: (artifact) => set({ selectedArtifact: artifact })
}))
```

#### **3.3 Setup react-konva para el Grafo** ⏳
```typescript
// src/components/graph/GraphContainer.tsx
import React from 'react'
import { Stage, Layer } from 'react-konva'
import { NodeRenderer } from './NodeRenderer'
import { LinkRenderer } from './LinkRenderer'
import { useArtifactStore } from '../../stores/artifactStore'

export const GraphContainer: React.FC = () => {
  const { artifacts } = useArtifactStore()
  
  return (
    <Stage width={800} height={600}>
      <Layer>
        <LinkRenderer artifacts={artifacts} />
        <NodeRenderer artifacts={artifacts} />
      </Layer>
    </Stage>
  )
}
```

### **Fase 4: Editor WYSIWYG** (Semana 6) ⏳

#### **4.1 Editor con Autocompletado** ⏳
```typescript
// src/components/editor/Editor.tsx
import React, { useState, useRef } from 'react'
import { useArtifactStore } from '../../stores/artifactStore'

export const Editor: React.FC = () => {
  const [content, setContent] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const { artifacts } = useArtifactStore()
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    
    setContent(value)
    setCursorPosition(cursorPos)
    
    // Detectar @ para autocompletado
    const beforeCursor = value.slice(0, cursorPos)
    const match = beforeCursor.match(/@(\w*)$/)
    
    if (match) {
      setShowAutocomplete(true)
    } else {
      setShowAutocomplete(false)
    }
  }
  
  return (
    <div className="relative">
      <textarea
        value={content}
        onChange={handleInput}
        className="w-full h-64 p-4 border rounded-lg"
        placeholder="Escribe @ para referenciar artefactos..."
      />
      {showAutocomplete && (
        <AutocompleteDropdown 
          artifacts={artifacts}
          onSelect={(artifact) => {
            // Insertar referencia @ArtifactId
            const beforeAt = content.slice(0, content.lastIndexOf('@'))
            const afterAt = content.slice(cursorPosition)
            setContent(beforeAt + `@${artifact.id} ` + afterAt)
            setShowAutocomplete(false)
          }}
        />
      )}
    </div>
  )
}
```

### **Fase 5: Testing y Optimización** (Semana 7) ⏳

#### **5.1 Setup Testing** ⏳
```bash
# Instalar herramientas de testing
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom
```

#### **5.2 Configurar Vitest para React** ⏳
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

#### **5.3 Ejemplo de Test** ⏳
```typescript
// src/components/Editor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Editor } from './Editor'
import { ArtifactStoreProvider } from '../../stores/artifactStore'

describe('Editor', () => {
  it('should show autocomplete when typing @', () => {
    render(
      <ArtifactStoreProvider>
        <Editor />
      </ArtifactStoreProvider>
    )
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: '@test' } })
    
    expect(screen.getByText('Autocompletado')).toBeInTheDocument()
  })
})
```

## 📊 Métricas de Progreso

### **Fase 1: Setup React + TypeScript** ✅ 100%
- [x] Configuración de React + TypeScript
- [x] Configuración de Vite
- [x] Setup TypeScript strict mode

### **Fase 2: Migrar Componentes Core** 🔄 40%
- [x] EventBus Context
- [x] NotificationManager Hook
- [x] Estructura de componentes básica
- [x] Zustand store implementado
- [x] Componentes esqueleto creados
- [ ] Migración de servicios existentes
- [ ] Integración con funcionalidades reales
- [ ] Editor de artefactos funcional
- [ ] Grafo interactivo con D3.js

### **Fase 3: Stack Moderno** ⏳ 0%
- [x] Zustand stores básicos
- [ ] shadcn/ui setup
- [ ] react-konva integration
- [ ] Framer Motion
- [ ] Componentes UI modernos

### **Fase 4: Editor WYSIWYG** ⏳ 0%
- [ ] Editor con autocompletado
- [ ] Resaltado de sintaxis
- [ ] Atajos de teclado
- [ ] Referencias semánticas

### **Fase 5: Testing y Optimización** ⏳ 0%
- [ ] Setup testing
- [ ] Tests de componentes
- [ ] Performance optimization
- [ ] Bundle optimization

## 🎯 Estado Actual - Esqueleto Básico

### **✅ Implementado (Solo Esqueleto)**
- ✅ React + TypeScript configurado
- ✅ Vite con HMR funcionando
- ✅ Estructura de componentes básica
- ✅ Zustand store para artefactos
- ✅ Sistema de notificaciones básico
- ✅ Layout responsive básico
- ✅ Componentes placeholder

### **❌ NO Implementado (Funcionalidades Reales)**
- ❌ Editor de artefactos funcional
- ❌ Grafo interactivo con D3.js
- ❌ Creación/edición de artefactos
- ❌ Búsqueda y filtrado real
- ❌ Exportación/importación
- ❌ Autocompletado con @
- ❌ Referencias semánticas
- ❌ Visualización de relaciones
- ❌ shadcn/ui components
- ❌ react-konva integration

## 🚨 Funcionalidades Críticas Pendientes

### **1. Editor de Artefactos** ⏳
- Editor WYSIWYG con autocompletado `@`
- Resaltado de sintaxis para artefactos
- Atajos de teclado para navegación
- Referencias semánticas funcionales

### **2. Grafo Interactivo** ⏳
- Integración con D3.js o react-konva
- Nodos arrastrables y redimensionables
- Creación de relaciones entre artefactos
- Zoom y pan en el canvas
- Visualización de tipos de artefactos

### **3. Gestión de Artefactos** ⏳
- CRUD completo de artefactos
- Validación de tipos y estructura
- Búsqueda y filtrado avanzado
- Exportación/importación de datos

### **4. UI/UX Moderna** ⏳
- shadcn/ui components
- Iconos con lucide-react
- Animaciones con Framer Motion
- Modales y tooltips
- Notificaciones mejoradas

## 🎉 Logros de la Fase 1 y 2

### **✅ Configuración Completa**
- React 18 + TypeScript configurado
- Vite con plugin de React funcionando
- TypeScript strict mode activado
- Build de producción exitoso

### **✅ Arquitectura Modular**
- EventBus migrado a React Context
- NotificationManager como hook personalizado
- Zustand store para gestión de estado
- Componentes con responsabilidad única

### **✅ Esqueleto Funcional**
- Dashboard React funcionando
- Sistema de notificaciones básico
- Gestión de artefactos con Zustand
- Interfaz de usuario responsive básica

### **✅ Estructura Escalable**
- Directorios organizados por funcionalidad
- Tipos TypeScript definidos
- Hooks personalizados reutilizables
- Context providers configurados

---

**IMPORTANTE**: La versión React actual es solo un esqueleto básico. Las funcionalidades reales del dashboard (editor, grafo interactivo, gestión de artefactos) están pendientes de implementación. El roadmap debe enfocarse en implementar estas funcionalidades críticas antes de considerar la migración completa. 