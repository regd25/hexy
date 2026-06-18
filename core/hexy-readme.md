# Hexy Framework

**Context-Aware AI Framework with Semantic Reasoning**

Hexy es un framework de código abierto para inteligencia artificial que implementa orquestación dinámica de contexto usando tecnologías semánticas avanzadas. Diseñado para agentes inteligentes que requieren comprensión profunda del contexto y explicabilidad de decisiones.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Framework](https://img.shields.io/badge/framework-hexy-green.svg)](https://github.com/regd25/hexy)

## 🎯 Características Principales

### 🧠 Motor de Contexto Inteligente
- **Orquestación Dinámica**: Selección automática del contexto más relevante para cada tarea
- **Compresión Semántica**: Optimización inteligente del contexto sin pérdida de información crítica
- **Explicabilidad**: Justificación detallada de por qué se seleccionó cada elemento de contexto
- **Memoria Contextual**: Aprendizaje de patrones contextuales para mejorar futuras decisiones

### 🌐 Integración Semantic Web
- **Ontologías OWL**: Soporte completo para OWL 2.0 con razonamiento automático
- **Procesamiento RDF**: Manejo nativo de grafos RDF con consultas SPARQL optimizadas
- **Múltiples Formatos**: Compatible con RDF/XML, Turtle, N3, JSON-LD
- **Razonamiento**: Integración con HermiT, Pellet y otros reasoners

### 🤖 Arquitectura para Agentes IA
- **LLM Integration**: Optimización de contexto para modelos de lenguaje
- **Multi-Agent Coordination**: Orquestación de múltiples agentes especializados
- **RAG Enhancement**: Recuperación aumentada por generación con contexto semántico
- **Task Planning**: Descomposición inteligente de tareas complejas

## 🏗️ Arquitectura

Hexy sigue el **principio DRY** (Don't Repeat Yourself) reutilizando librerías maduras:

- **[Owlready2](https://owlready2.readthedocs.io/)**: Manipulación de ontologías OWL
- **[RDFLib](https://rdflib.readthedocs.io/)**: Procesamiento de grafos RDF y SPARQL  
- **[FastAPI](https://fastapi.tiangolo.com/)**: APIs REST modernas
- **[NetworkX](https://networkx.org/)**: Análisis de grafos de conocimiento
- **[Redis](https://redis.io/)**: Cache distribuido y gestión de memoria

## 🚀 Instalación

### Requisitos del Sistema
- Python 3.9 o superior
- Redis Server (para cache)
- PostgreSQL (opcional, para persistencia)

### Instalación Básica

```bash
# Instalar dependencias básicas
pip install owlready2>=0.44 rdflib>=7.0.0 fastapi>=0.109.0 pydantic>=2.5.0

# Dependencias opcionales
pip install networkx>=3.2.1 redis>=5.0.0 spacy>=3.7.0
```

## 📖 Uso Rápido

### Ejemplo Básico de Ontologías

```python
import asyncio
from hexy_ontology_manager import HexyOntologyManager
from hexy_rdf_processor import HexyRDFProcessor

async def main():
    # Inicializar componentes
    ontology_manager = HexyOntologyManager()
    rdf_processor = HexyRDFProcessor()
    
    # Ontología de ejemplo en Turtle
    example_ontology = """
    @prefix ex: <http://example.org/demo#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    
    ex:Technology a owl:Class ;
        rdfs:label "Technology" .
    
    ex:AI a owl:Class ;
        rdfs:subClassOf ex:Technology ;
        rdfs:label "Artificial Intelligence" .
    
    ex:GPT a ex:AI ;
        rdfs:label "GPT" ;
        ex:developedBy "OpenAI" .
    """
    
    # Cargar ontología
    graph_id = await rdf_processor.load_rdf_data(example_ontology)
    
    # Consulta SPARQL
    query = """
    PREFIX ex: <http://example.org/demo#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?tech ?label WHERE {
        ?tech a ex:AI ;
              rdfs:label ?label .
    }
    """
    
    results = await rdf_processor.execute_sparql_query(query)
    for result in results:
        print(f"Technology: {result['label']}")

# Ejecutar
asyncio.run(main())
```

### Extracción de Contexto

```python
# Extraer entidades del grafo
entities = await rdf_processor.extract_entities_from_graph(graph_id)

# Crear contexto desde triplas RDF
context_items = await rdf_processor.create_context_items_from_triples(
    graph_id, 
    "http://example.org/demo#GPT",
    max_depth=2
)

print(f"Generated {len(context_items)} context items")
for item in context_items:
    print(f"- {item['content']}")
```

## 🎮 Ejemplos

### Ejecutar Ejemplo Básico

```bash
python hexy_basic_example.py
```

Este ejemplo demuestra:
- ✅ Carga de ontologías
- ✅ Consultas SPARQL  
- ✅ Extracción de entidades
- ✅ Generación de contexto
- ✅ Simulación de orquestación

## ⚙️ Configuración

### Variables de Entorno

```env
# Ontologías
HEXY_ONTO_REASONER=hermit
HEXY_ONTO_MAX_TIME=30

# Contexto
HEXY_CTX_MAX_ITEMS=1000
HEXY_CTX_THRESHOLD=0.5
HEXY_CTX_COMPRESSION=true

# APIs (opcional)
OPENAI_API_KEY=tu_api_key_aqui
HEXY_LLM_PROVIDER=openai
```

### Configuración Programática

```python
config = {
    "reasoner": "hermit",
    "max_reasoning_time": 30,
    "cache_inferences": True
}

ontology_manager = HexyOntologyManager(config)
```

## 🧪 Testing

```bash
# Instalar dependencias de desarrollo
pip install pytest pytest-asyncio

# Ejecutar tests (cuando estén implementados)
pytest tests/
```

## 🌟 Casos de Uso

### 1. Asistentes Inteligentes con Conocimiento de Dominio
- **Problema**: Asistentes genéricos carecen de conocimiento especializado
- **Solución Hexy**: Contexto semántico específico del dominio con explicabilidad

### 2. Sistemas de Recomendación Explicables  
- **Problema**: Recomendaciones tipo "caja negra" sin justificación
- **Solución Hexy**: Explicaciones basadas en ontologías y razonamiento

### 3. Análisis de Documentos Científicos
- **Problema**: Dificultad para extraer conocimiento estructurado
- **Solución Hexy**: Enlazado automático con ontologías científicas

## 🛣️ Roadmap

### v0.2.0 - Q4 2025
- [ ] Interfaz web completa
- [ ] Integración con más LLM providers
- [ ] Sistema de plugins extensible
- [ ] Metrics dashboard

### v0.3.0 - Q1 2026  
- [ ] Distributed deployment
- [ ] GraphDB integration nativa
- [ ] Auto-tuning de hiperparámetros
- [ ] Multi-language support

## 🤝 Contribuir

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/regd25/hexy.git
cd hexy

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar ejemplo
python hexy_basic_example.py
```

### Áreas de Contribución

- 🧠 **Algoritmos de IA**: Mejoras en selección y compresión de contexto
- 🌐 **Semantic Web**: Nuevos conectores y reasoners  
- 🔧 **Tooling**: CLI, interfaces, deployment
- 📚 **Documentación**: Tutoriales, ejemplos, guías

## 📜 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 🙏 Agradecimientos

Hexy Framework está construido sobre el excelente trabajo de:

- **[Owlready2](https://owlready2.readthedocs.io/)** por Jean-Baptiste Lamy
- **[RDFLib](https://github.com/RDFLib/rdflib)** por RDFLib team
- **[FastAPI](https://fastapi.tiangolo.com/)** por Sebastián Ramirez
- La comunidad **Semantic Web** y **W3C**

## 📞 Contacto

- **GitHub**: [github.com/regd25/hexy](https://github.com/regd25/hexy)
- **Email**: dev@hexy-framework.org

---

<div align="center">

**⭐ Si Hexy Framework te resulta útil, considera darle una estrella en GitHub ⭐**

*Construido con ❤️ por la comunidad Open Source*

</div>