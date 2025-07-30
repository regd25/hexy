# Hexy Dashboard - Reglas de Negocio

## Descripción General

El Dashboard de Hexy es una aplicación web que permite la visualización, edición y gestión de artefactos semánticos organizacionales. Proporciona una interfaz gráfica para crear, modificar y relacionar artefactos que representan la lógica de negocio de una organización.

## Arquitectura y Principios

### Principios SOLID Aplicados

1. **Principio de Responsabilidad Única (SRP)**
   - Cada clase tiene una única responsabilidad
   - `GraphService`: Gestionar la visualización del grafo
   - `EditorService`: Gestionar el editor de texto
   - `ArtifactParser`: Analizar y procesar artefactos
   - `ConfigService`: Gestionar la configuración del grafo
   - `SemanticService`: Manejar relaciones semánticas

2. **Principio de Abierto/Cerrado (OCP)**
   - Las clases están abiertas para extensión pero cerradas para modificación
   - Se pueden añadir nuevos tipos de artefactos sin modificar el código existente

3. **Principio de Sustitución de Liskov (LSP)**
   - Las clases derivadas pueden sustituir a sus clases base
   - Diseñado para permitir herencia en el futuro

4. **Principio de Segregación de Interfaces (ISP)**
   - Cada servicio expone solo los métodos necesarios para su funcionalidad

5. **Principio de Inversión de Dependencias (DIP)**
   - Se utilizan inyecciones de dependencias para desacoplar los módulos

## Modelos de Datos

### Artifact

**Propiedades:**
- `id` (string): Identificador único del artefacto
- `name` (string): Nombre del artefacto
- `type` (string): Tipo del artefacto
- `info` (string): Descripción del artefacto
- `description` (string): Alias de info
- `x`, `y` (number): Coordenadas de posición
- `vx`, `vy` (number): Velocidad de movimiento
- `fx`, `fy` (number|null): Posición fija

**Métodos:**
- `static createReference(id)`: Crea un artefacto de tipo referencia

### Link

**Propiedades:**
- `source` (Artifact): Artefacto de origen
- `target` (Artifact): Artefacto de destino
- `weight` (number): Peso del enlace (default: 1)

**Métodos:**
- `getId()`: Genera un ID único para el enlace
- `isValid()`: Verifica si el enlace es válido

## Tipos de Artefactos

### Jerarquía de Tipos

1. **purpose** - Propósito organizacional
2. **vision** - Visión estratégica
3. **policy** - Políticas organizacionales
4. **principle** - Principios fundamentales
5. **guideline** - Guías de actuación
6. **context** - Contextos organizacionales
7. **actor** - Actores del sistema
8. **concept** - Conceptos clave
9. **process** - Procesos organizacionales
10. **procedure** - Procedimientos específicos
11. **event** - Eventos del sistema
12. **result** - Resultados esperados
13. **observation** - Observaciones
14. **evaluation** - Evaluaciones
15. **indicator** - Indicadores de rendimiento
16. **area** - Áreas organizacionales
17. **authority** - Autoridades
18. **reference** - Referencias (generado automáticamente)

### Mapeo de Tipos

```javascript
TYPE_MAP = {
  Purpose: 'purpose',
  Context: 'context',
  Authority: 'authority',
  Evaluation: 'evaluation',
  Vision: 'vision',
  Policy: 'policy',
  Principle: 'principle',
  Guideline: 'guideline',
  Concept: 'concept',
  Indicator: 'indicator',
  Process: 'process',
  Procedure: 'procedure',
  Event: 'event',
  Result: 'result',
  Observation: 'observation',
  Actor: 'actor',
  Area: 'area',
  Contextos: 'context',
  Actores: 'actor',
  Conceptos: 'concept',
  Procesos: 'process'
}
```

## Reglas de Negocio

### 1. Creación de Artefactos

**Reglas:**
- Cada artefacto debe tener un ID único generado a partir del nombre
- El ID se genera eliminando espacios del nombre
- Todos los campos (nombre, tipo, descripción) son obligatorios
- Los artefactos de tipo "reference" se crean automáticamente para referencias no definidas

**Validaciones:**
- El nombre no puede estar vacío
- El tipo debe ser uno de los tipos válidos definidos
- La descripción debe proporcionar contexto suficiente

### 2. Relaciones entre artefactos

**Sintaxis:**
- Las relaciones se marcan con `@` seguido del nombre del artefacto
- Ejemplo: `@NombreArtefacto`

**Reglas:**
- No se puede crear una relación consigo mismo
- El tipo de relación es obligatorio
- Los artefactos de origen deben existir
- Las relaciones se detectan automáticamente en las descripciones
- Se crean enlaces automáticos entre artefactos relacionados
- Los artefactos relacionados pero no definidos se crean como "reference"
- Los artefactos "reference" deben definirse imediatamente despues de crear la relacion

### 3. Visualización del Grafo

**Configuración:**
- Cada tipo de artefacto tiene un color específico
- Los colores son configurables a través del ConfigService
- El grafo utiliza D3.js para la visualización
- Los nodos se posicionan automáticamente usando fuerza
- Las relaciones se muestran como líneas entre nodos
- El peso y configuracion de la relacion se muestran en el tooltip del nodo de destino
- El peso de la relacion se calcula en base a la configuracion de peso de la relacion desde el ConfigService

**Interacciones:**
- Clic derecho: Muestra menú contextual
- Drag: Mueve el canvas
- Zoom: Escala la vista del grafo (doble clic para zoom)
- ✅ Clic en el canvas vacío: Crea un nuevo artefacto editable
- ✅ Alt/Ctrl/Cmd + clic en el canvas: Crea un nuevo artefacto editable
- ❌ Ctrl + clic + drag: Selecciona múltiples artefactos
- ❌ Ctrl + A: Selecciona todos los artefactos
- ❌ Ctrl + D: Duplica los artefactos seleccionados
- ❌ Ctrl + Z: Deshace la última acción
- ❌ Ctrl + Y: Rehace la última acción
- ❌ Ctrl + C: Copia los artefactos seleccionados y sus relaciones
- ❌ Ctrl + V: Pega los artefactos copiados y sus relaciones
- ❌ Ctrl + X: Corta los artefactos seleccionados y sus relaciones
- ❌ Ctrl + rueda del mouse (+/-): Mueve el canvas hacia arriba o abajo
- ❌ Shift + rueda del mouse (+/-): Mueve el canvas hacia la izquierda o derecha

**Interacciones sobre el nodo:**
- Clic izquierdo: Selecciona el artefacto
- Drag: Mueve el nodo
- ✅ Doble clic en el nodo: Edita el artefacto
- Clic derecho: Muestra menú contextual
- ✅ Enter: Guarda cambios en el modal de edición
- ✅ Escape: Cancela cambios en el modal de edición
- ✅ Ctrl+Enter: Guarda cambios en el modal de descripción
- ❌ Alt + clic derecho: Rota el tipo de artefacto
- ❌ Alt + rueda del mouse (+/-): Reconfigura el peso de la relacion manualmente (solo en el nodo de destino)
- ❌ Delete: Elimina los artefactos seleccionados
- ❌ Ctrl + clic: Selecciona el artefacto

### 4. Busqueda y Filtrado

**Funcionalidades:**
- Búsqueda en tiempo real por nombre de artefacto
- Filtrado por tipo de artefacto
- Contador de artefactos visible
- Búsqueda case-insensitive
- Búsqueda por tipo de artefacto
- Búsqueda por tipo de relacion
- Búsqueda por peso de la relacion
- Búsqueda por nombre de artefacto
- Búsqueda por descripcion de artefacto
- Búsqueda por tipo de relacion

### 5. Importación y Exportación

**Formatos Soportados:**
- JSON: Para datos completos del dashboard
- JSON-LD: Para datos completos del dashboard
- Texto plano: Para edición manual

**Reglas de Exportación:**
- Los datos se exportan en formato JSON estructurado
- Las relaciones semánticas se exportan en formato JSON-LD
- Se incluyen metadatos de configuración

### 6. Validación Semántica

**Reglas de Validación:**
- Verificación de coherencia entre tipos de artefactos
- Validación de relaciones jerárquicas
- Comprobación de referencias circulares
- Validación de completitud de información
- Validación de relaciones semánticas
- Validación de relaciones entre artefactos

**Sugerencias de IA:**
- Generación automática de justificaciones para relaciones
- Análisis semántico de conexiones entre artefactos
- Sugerencias de mejora para la estructura organizacional
- Sugerencias de mejora para la relacion entre artefactos

### 7. Gestión de Configuración

**Configuraciones:**
- ✅ Colores personalizables por tipo de artefacto
- ❌ Peso de las relaciones
- ❌ Configuracion de peso de las relaciones
- ❌ Configuración de visualización del grafo
- ❌ Configuración del editor de texto
- ❌ Configuración de exportación
- ✅ Configuracion de la paleta de colores
- ❌ Configuracion de la paleta de colores de los enlaces
- ✅ Configuracion de la paleta de colores de los nodos
- ❌ Configuracion de la paleta de colores de los enlaces
- ❌ Configuracion de peso de las relaciones

**Persistencia:**
- ✅ Las configuraciones se mantienen en el localStorage
- ✅ Las configuraciones se pueden exportar/importar en formato JSON

### 8. Gestión de Contexto Organizacional

**Funcionalidades de IA:**
- Onboarding para el usuario a traves de la ontologia de contexto organizacional
- Construccion de artefactos semánticos (si no hay artefactos definidos)
- Guias de estudio de contexto organizacional
- Guias de estudio de procesos organizacionales
- Guias de estudio de relaciones entre artefactos

## Servicios Principales

### ArtifactParser
- Analiza texto y extrae artefactos y relaciones
- Detecta referencias automáticamente
- Valida la estructura de los datos
- Genera enlaces entre artefactos referenciados

### SemanticService
- Maneja sugerencias de IA para relaciones
- Valida relaciones semánticas
- Verifica reglas jerárquicas
- Exporta relaciones en formato SOL

### GraphService
- Gestiona la visualización del grafo D3.js
- Maneja interacciones de usuario
- Actualiza posiciones de nodos
- Gestiona eventos del grafo

### EditorService
- Proporciona funcionalidad de edición de texto
- Maneja modales de edición
- Gestiona cambios en tiempo real
- Integra con el parser de artefactos

### ConfigService
- ✅ Gestiona configuración de colores
- ✅ Proporciona interfaz de configuración
- ✅ Persiste configuraciones de usuario en localStorage
- ✅ Aplica cambios de configuración
- ✅ Gestiona la paleta de colores
- ❌ Gestiona el peso de las relaciones
- ❌ Gestiona la configuracion de la visualizacion del grafo
- ❌ Gestiona la configuracion del editor de texto
- ✅ Gestiona la configuracion de exportacion
- ✅ Gestiona la configuracion de importacion
- ✅ Gestiona la configuracion de la paleta de colores

## Flujos de Trabajo

### 1. Creación de Artefacto
1. ✅ Usuario hace clic en "Nuevo Artefacto", "Clic en el canvas vacío", o "Alt/Ctrl/Cmd + clic en el canvas"
2. ✅ Se crea el artefacto en el grafo en la posición del clic
3. ✅ Se preselecciona el artefacto creado y se permite editar el nombre
4. ✅ Se permite guardar con enter o clic fuera del input
5. ✅ Inmediatamente te abre el modal de edicion de descripcion del artefacto
6. ✅ Se actualiza el contador de artefactos

### 2. Edición de Artefacto
1. ✅ Usuario selecciona un artefacto con cualquiera de los metodos de seleccion
2. ✅ Se abre el modal de edicion de descripcion del artefacto
3. ✅ Se permite guardar con Enter, Ctrl+Enter (en descripción), o clic en "Guardar"
4. ✅ Se permite cancelar con Escape o clic en "Cancelar"
5. ✅ Se actualiza el nombre y ID del artefacto al guardar
6. ✅ Se actualiza el grafo
7. ✅ Se actualiza el contador de artefactos

### 3. Creación de Relación Semántica
1. Usuario selecciona dos artefactos con cualquiera de los metodos de seleccion
2. Se muestra el modal de edicion del artefacto de destino
3. Se genera sugerencia de IA (si no hay sugerencia, se muestra un mensaje de que no hay sugerencia)
4. Se coloca la sugerencia en el input de la relacion
5. Se permite guardar con enter o clic fuera del input
6. Se actualiza el grafo
7. Se actualiza el contador de artefactos

### 4. Exportación de Datos
1. Usuario selecciona el menu de exportacion
2. El usuario puede elegir entre exportar en formato JSON o JSON-LD
3. Se genera el archivo de exportación
4. Usuario descarga el archivo

### 5. Importación de Datos
1. Usuario selecciona el menu de importacion
2. El usuario puede elegir entre importar desde JSON o JSON-LD
3. Se genera el archivo de importación
4. Usuario descarga el archivo
5. Se actualiza el contador de artefactos
6. Se actualiza el grafo

## Consideraciones de Rendimiento

### Optimizaciones
- Renderizado lazy de nodos del grafo
- Debouncing en búsquedas
- Caching de configuraciones
- Actualización incremental del grafo

### Límites
- Máximo 1000 artefactos para rendimiento óptimo
- Máximo 5000 relaciones
- Tamaño máximo de descripción: 1000 caracteres

## Seguridad y Validación

### Validaciones de Entrada
- Sanitización de HTML en descripciones
- Validación de tipos de datos
- Límites en tamaños de entrada
- Prevención de XSS

### Validaciones de Negocio
- Verificación de integridad referencial
- Validación de jerarquías organizacionales
- Comprobación de coherencia semántica
- Validación de reglas de negocio específicas

## Extensibilidad

### Puntos de Extensión
- Nuevos tipos de artefactos
- Nuevos tipos de relaciones
- Nuevos formatos de exportación
- Nuevos servicios de validación
- Nuevos algoritmos de visualización

### Patrones de Diseño
- Factory Pattern para creación de artefactos
- Observer Pattern para actualizaciones del grafo
- Strategy Pattern para diferentes tipos de exportación
- Command Pattern para operaciones de edición