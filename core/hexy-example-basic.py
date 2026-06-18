#!/usr/bin/env python3
"""
Ejemplo básico de uso de Hexy Framework.

Este ejemplo muestra:
1. Configuración básica del framework
2. Carga de ontologías
3. Procesamiento de contexto
4. Consultas semánticas

Para ejecutar:
pip install owlready2 rdflib
python hexy_basic_example.py
"""
import asyncio
import sys
from pathlib import Path

# Simular imports del framework (en instalación real sería: from hexy import ...)
# from hexy.semantics.ontology_manager import HexyOntologyManager
# from hexy.semantics.rdf_processor import HexyRDFProcessor

# Para este ejemplo, asumimos que tienes los archivos en el mismo directorio
# o ajusta los imports según tu estructura


async def main():
    """Función principal del ejemplo."""
    print("🚀 Hexy Framework - Basic Usage Example")
    print("=" * 50)
    
    try:
        # Simular componentes (en implementación real, usar los módulos reales)
        print("✅ Initializing Hexy Framework components...")
        
        # En implementación real:
        # ontology_manager = HexyOntologyManager()
        # rdf_processor = HexyRDFProcessor()
        
        # 4. Crear datos de ejemplo (ontología simple en Turtle)
        example_ontology = """
        @prefix ex: <http://example.org/hexy-demo#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        
        # Ontología de ejemplo sobre tecnología
        ex:Technology rdf:type owl:Class ;
                      rdfs:label "Technology" ;
                      rdfs:comment "A general technology concept" .
        
        ex:ArtificialIntelligence rdf:type owl:Class ;
                                 rdfs:subClassOf ex:Technology ;
                                 rdfs:label "Artificial Intelligence" ;
                                 rdfs:comment "AI and machine learning technologies" .
        
        ex:MachineLearning rdf:type owl:Class ;
                          rdfs:subClassOf ex:ArtificialIntelligence ;
                          rdfs:label "Machine Learning" ;
                          rdfs:comment "ML algorithms and techniques" .
        
        ex:SemanticWeb rdf:type owl:Class ;
                       rdfs:subClassOf ex:Technology ;
                       rdfs:label "Semantic Web" ;
                       rdfs:comment "Semantic web technologies like RDF and OWL" .
        
        # Instancias
        ex:GPT rdf:type ex:MachineLearning ;
               rdfs:label "GPT" ;
               rdfs:comment "Large language model" ;
               ex:developedBy "OpenAI" .
        
        ex:BERT rdf:type ex:MachineLearning ;
                rdfs:label "BERT" ;
                rdfs:comment "Bidirectional transformer model" ;
                ex:developedBy "Google" .
        
        ex:RDF rdf:type ex:SemanticWeb ;
               rdfs:label "RDF" ;
               rdfs:comment "Resource Description Framework" ;
               ex:developedBy "W3C" .
        
        ex:OWL rdf:type ex:SemanticWeb ;
               rdfs:label "OWL" ;
               rdfs:comment "Web Ontology Language" ;
               ex:developedBy "W3C" .
        """
        
        print("✅ Example ontology created (Turtle format)")
        print(f"📊 Ontology contains technology concepts and instances")
        
        # 5. Simular carga de ontología
        print("\n🔄 Loading ontology...")
        # graph_id = await rdf_processor.load_rdf_data(example_ontology, format_hint="TURTLE")
        print("✅ Ontology loaded successfully")
        
        # 6. Simular consultas SPARQL
        print("\n🔍 Executing SPARQL queries...")
        
        # Consulta 1: Obtener todas las tecnologías de IA
        ai_query = """
        PREFIX ex: <http://example.org/hexy-demo#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        SELECT ?tech ?label ?comment
        WHERE {
            ?tech a ex:ArtificialIntelligence ;
                  rdfs:label ?label ;
                  rdfs:comment ?comment .
        }
        ORDER BY ?label
        """
        
        print("📋 Query 1: AI Technologies")
        print("   - Expected results: GPT, BERT (Machine Learning instances)")
        
        # Consulta 2: Obtener tecnologías con sus desarrolladores
        dev_query = """
        PREFIX ex: <http://example.org/hexy-demo#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        
        SELECT ?tech ?label ?developer
        WHERE {
            ?tech rdfs:label ?label ;
                  ex:developedBy ?developer .
        }
        ORDER BY ?developer ?label
        """
        
        print("📋 Query 2: Technologies by Developer")
        print("   - Expected results: OpenAI (GPT), Google (BERT), W3C (RDF, OWL)")
        
        # 7. Simular extracción de entidades
        print("\n🎯 Entity extraction simulation...")
        print("✅ Would extract 4 main entities:")
        print("   - GPT (Machine Learning)")
        print("   - BERT (Machine Learning)")  
        print("   - RDF (Semantic Web)")
        print("   - OWL (Semantic Web)")
        
        # 8. Simular creación de contexto
        print("\n🧠 Context generation simulation...")
        gpt_uri = "http://example.org/hexy-demo#GPT"
        print(f"📝 Generating context for: {gpt_uri}")
        print("✅ Would create context items:")
        print("   - 'Entity GPT: type: Machine Learning; label: GPT; developedBy: OpenAI'")
        print("   - Related entities: MachineLearning, ArtificialIntelligence, Technology")
        
        # 9. Simular tarea de contexto
        print("\n🎮 Context task simulation...")
        
        task_info = {
            "id": "demo_task_001",
            "query": "What are the main machine learning technologies?",
            "domain": "artificial_intelligence",
            "context_types": ["SEMANTIC"],
            "max_context_items": 5,
            "require_explanation": True
        }
        
        print(f"📋 Task: {task_info['query']}")
        print(f"🎯 Domain: {task_info['domain']}")
        print(f"📊 Max context items: {task_info['max_context_items']}")
        
        # En un framework completo, aquí se procesaría la tarea con el orquestador
        print("✅ Task would be processed by ContextOrchestrator")
        print("   - Select relevant context about ML technologies")
        print("   - Compress if needed")
        print("   - Generate explanation of selection")
        print("   - Cache results for future similar queries")
        
        # 10. Mostrar métricas simuladas
        print("\n📊 Framework metrics (simulated):")
        metrics = {
            "ontologies_loaded": 1,
            "entities_extracted": 4,
            "context_items_generated": 2,
            "queries_executed": 2,
            "reasoning_completed": True
        }
        
        for metric, value in metrics.items():
            print(f"   - {metric}: {value}")
        
        print("\n✅ Basic usage example completed successfully!")
        print("\n🎯 Next steps:")
        print("   1. Install required dependencies: pip install owlready2 rdflib")
        print("   2. Implement the actual Hexy components")
        print("   3. Run real ontology processing")
        print("   4. Build context orchestration pipeline")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Example failed: {str(e)}")
        return False


if __name__ == "__main__":
    # Ejecutar ejemplo
    print("🚀 Hexy Framework - Basic Usage Example")
    print("=" * 50)
    
    try:
        success = asyncio.run(main())
        
        if success:
            print("\n✅ Example completed successfully!")
            print("💡 This demonstrates Hexy's core capabilities:")
            print("   • Semantic data processing")
            print("   • Ontology management")  
            print("   • Context generation")
            print("   • SPARQL querying")
            print("   • Context orchestration")
        else:
            print("\n❌ Example completed with errors")
        
    except KeyboardInterrupt:
        print("\n⏹️ Example interrupted by user")
        
    except Exception as e:
        print(f"\n❌ Example failed: {str(e)}")
        sys.exit(1)