# Hexy Dashboard

## Estructura del Proyecto

El dashboard de Hexy ha sido modularizado siguiendo los principios SOLID, especialmente el Principio de Responsabilidad Única (SRP). La estructura del proyecto es la siguiente:

```
dashboard/
├── graph/           # Componentes relacionados con la visualización del grafo
│   ├── GraphService.js    # Servicio para gestionar el grafo D3.js
│   └── ConfigService.js   # Servicio para configurar el grafo
├── editor/          # Componentes relacionados con el editor de texto
│   └── EditorService.js   # Servicio para gestionar el editor
├── shared/          # Componentes compartidos entre módulos
│   ├── constants.js       # Constantes utilizadas en toda la aplicación
│   └── utils.js           # Utilidades compartidas
├── models/          # Modelos de datos
│   └── Artifact.js        # Clases para representar artefactos y enlaces
├── services/        # Servicios de la aplicación
│   └── ArtifactParser.js  # Servicio para analizar y procesar artefactos
├── pages/           # Páginas de la aplicación
│   └── Dashboard.js       # Clase principal que integra todos los componentes
├── index.html       # Página HTML principal
├── styles.css       # Estilos CSS
└── index.js         # Punto de entrada de la aplicación
```

## Principios SOLID Aplicados

1. **Principio de Responsabilidad Única (SRP)**: Cada clase tiene una única responsabilidad.
   - `GraphService`: Gestionar la visualización del grafo.
   - `EditorService`: Gestionar el editor de texto.
   - `ArtifactParser`: Analizar y procesar artefactos.
   - `ConfigService`: Gestionar la configuración del grafo.

2. **Principio de Abierto/Cerrado (OCP)**: Las clases están abiertas para extensión pero cerradas para modificación.
   - Se pueden añadir nuevos tipos de artefactos sin modificar el código existente.

3. **Principio de Sustitución de Liskov (LSP)**: Las clases derivadas pueden sustituir a sus clases base.
   - No hay herencia en este proyecto, pero se ha diseñado para permitirla en el futuro.

4. **Principio de Segregación de Interfaces (ISP)**: Los clientes no deben depender de interfaces que no utilizan.
   - Cada servicio expone solo los métodos necesarios para su funcionalidad.

5. **Principio de Inversión de Dependencias (DIP)**: Los módulos de alto nivel no deben depender de los de bajo nivel.
   - Se utilizan inyecciones de dependencias para desacoplar los módulos.

## Cómo Ejecutar

Para ejecutar el dashboard, simplemente abre el archivo `index.html` en un navegador web o utiliza un servidor HTTP local:

```bash
python -m http.server
```

Luego, abre http://localhost:8000 en tu navegador.
