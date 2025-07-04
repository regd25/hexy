# Hexy Framework - Semantic Context Language (SOL) Landing Page

> *"Un lenguaje operativo que conecte humanos, máquinas e inteligencia artificial desde el contexto."*

## 🎯 Descripción

Esta es la landing page oficial del **Hexy Framework**, que presenta el **Semantic Context Language (SOL)** - un lenguaje de definición de contexto diseñado para modelar las interacciones, reglas, flujos y entidades que conforman sistemas vivos.

La landing page implementa todos los casos de uso definidos en el archivo `hexy.sol.yaml` y sigue las mejores prácticas de UX/UI modernas.

## 🏗️ Arquitectura

### Stack Tecnológico

- **Framework**: Next.js 14 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Búsqueda**: Fuse.js (búsqueda semántica)
- **Iconos**: Heroicons (SVG)

### Estructura del Proyecto

```
hexy/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── Header.tsx         # Navegación principal
│   ├── Hero.tsx           # Sección hero
│   ├── InteractiveSidebar.tsx  # Navegación lateral
│   ├── SearchModal.tsx    # Modal de búsqueda
│   ├── DocumentationModule.tsx # Módulos de documentación
│   ├── ArtifactLibrary.tsx     # Biblioteca de artefactos
│   └── Footer.tsx         # Footer
├── types/                 # Definiciones TypeScript
│   └── sol.ts            # Tipos SOL
├── lib/                   # Utilidades
├── .hexy/                 # Configuraciones SOL
│   └── landing/
│       └── landing_page.sol.yaml
├── hexy.sol.yaml         # Definición principal SOL
└── README.md
```

## 🎨 Diseño

### Esquema de Colores

El diseño sigue un esquema de colores moderno basado en tonos azul marino y teal:

- **Primario**: Teal (#14b8a6, #2dd4bf)
- **Secundario**: Púrpura (#a855f7, #8b5cf6)
- **Fondo**: Azul marino oscuro (#0f172a, #1e293b)
- **Texto**: Blanco y grises (#ffffff, #e2e8f0)
- **Bordes**: Grises azulados (#334155, #475569)

### Componentes de UI

- **Cards**: Fondo azul oscuro con bordes teal y efectos glow
- **Botones**: Primarios en púrpura, secundarios con outline teal
- **Navegación**: Sidebar interactivo con animaciones suaves
- **Modal**: Búsqueda semántica con overlay y backdrop blur

## 🚀 Casos de Uso Implementados

### 1. NavigateModules
- **Componente**: `InteractiveSidebar`
- **Descripción**: Navegación clara entre los 8 módulos de documentación SOL
- **Regla**: `AllModulesMustBeAccessible` - Todos los módulos enlazados en navegación lateral

### 2. SearchWithinDocs
- **Componente**: `SearchModal`
- **Descripción**: Búsqueda semántica contextual con Fuse.js
- **Regla**: `SearchMustBeHotkeyAccessible` - Activable con Cmd/Ctrl+K

### 3. BrowseArtifactLibrary
- **Componente**: `ArtifactLibrary`
- **Descripción**: Exploración de artefactos SOL de la comunidad
- **Características**: Filtros, ordenamiento, ratings, descargas

## 🧩 Conceptos SOL Implementados

### DocumentationModule
- **Propósito**: Secciones organizadas de documentación del lenguaje
- **Implementación**: Contenido dinámico basado en módulo activo
- **Narrativa**: Cada módulo preserva su intención pedagógica

### InteractiveSidebar
- **Propósito**: Menú contextual con navegación fluida
- **Implementación**: Sidebar responsive con animaciones
- **Narrativa**: La navegación debe ser intuitiva y accesible

### SearchModal
- **Propósito**: Buscador semántico con hotkey
- **Implementación**: Modal con Fuse.js y resultados categorizados
- **Narrativa**: La búsqueda debe ser rápida y contextual

### ArtifactLibrary
- **Propósito**: Colección de artefactos de la comunidad
- **Implementación**: Grid con filtros y metadata
- **Narrativa**: Los artefactos son conocimiento operativo vivo

## 🎯 Agentes SOL

### HexyOrganization
- **Descripción**: Agente que interactúa en lenguaje natural para crear definiciones SOL
- **Implementación**: Card interactivo en la sección Hero
- **Capacidades**: Guiar decisiones organizacionales basadas en KPIs y OKRs

### HexyAid
- **Descripción**: Agente que guía el desarrollo con código reutilizable
- **Implementación**: Card interactivo en la sección Hero
- **Capacidades**: Proporcionar código alineado con reglas SOL

## 🔧 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/regd25/hexy.git
cd hexy

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linting con ESLint
```

## 📱 Características

### Responsive Design
- Diseño mobile-first
- Breakpoints optimizados para tablet y desktop
- Navegación adaptativa (sidebar en desktop, overlay en móvil)

### Accesibilidad
- Navegación por teclado
- Hotkeys (Cmd/Ctrl+K para búsqueda, Escape para cerrar)
- Contraste de colores optimizado
- Semántica HTML correcta

### Performance
- Lazy loading de componentes
- Animaciones optimizadas con Framer Motion
- Imágenes optimizadas con Next.js
- CSS-in-JS con Tailwind para bundle size mínimo

### SEO
- Metadatos optimizados
- Open Graph tags
- Twitter Cards
- Estructura semántica HTML5

## 🌐 Integración SOL

### Exportación RDF/Turtle
La landing page está preparada para exportar definiciones SOL a formatos semánticos:

```turtle
@prefix sol: <http://hexy.org/sol#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

sol:HexyFramework a sol:Organization ;
    sol:mission "Conectar humanos, máquinas e IA desde el contexto" ;
    sol:hasAgent sol:HexyOrganization, sol:HexyAid .
```

### JSON-LD para SEO/AIO
Generación automática de structured data para motores de búsqueda y modelos de IA.

## 🤝 Contribución

### Proceso de Contribución SOL

1. **Context Kick-off**: Identificar problema y organización
2. **Concept Mining**: Extraer conceptos esenciales
3. **Use-Case Storming**: Describir acciones y narrativas
4. **Rule & KPI Binding**: Vincular políticas y métricas
5. **Narrative Capture**: Documentar razones e intenciones
6. **Validation Loop**: Revisión negocio-dev-IA
7. **Automation & Codegen**: Generar servicios y documentación

### Guidelines

- Seguir principios DDD y arquitectura hexagonal
- Mantener tipado fuerte en TypeScript
- Documentar nuevas funciones en formato SOL
- Preservar narrativas para cada artefacto

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🔗 Enlaces

- **Repositorio**: https://github.com/regd25/hexy
- **Documentación**: https://hexy.org/docs
- **Comunidad**: https://hexy.org/community
- **Issues**: https://github.com/regd25/hexy/issues

---

**Narrativa SOL**: *Esta landing page es la manifestación digital del lenguaje SOL. Cada componente, cada interacción, cada decisión de diseño está alineada con los principios del framework. Es tanto documentación como demostración viva del poder del contexto semántico.*
