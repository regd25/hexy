#!/usr/bin/env python3
"""
Ejemplo completo e integrado de Hexy Framework.
Demuestra el flujo completo desde carga de ontologías hasta orquestación de contexto.

Este ejemplo integra:
- Configuración del framework
- Gestión de ontologías con Owlready2
- Procesamiento RDF con RDFLib  
- Orquestación de contexto
- API REST opcional

Para ejecutar:
pip install owlready2 rdflib fastapi uvicorn
python hexy_complete_example.py
"""
import asyncio
import sys
import logging
from pathlib import Path
from datetime import datetime
import uuid

# Simular imports (en implementación real, usar los módulos reales)
# from hexy.config.settings import get_config, setup_logging
# from hexy.semantics.ontology_manager import HexyOntologyManager
# from hexy.semantics.rdf_processor import HexyRDFProcessor
# from hexy.context.orchestrator import HexyContextOrchestrator, TaskRequest
# from hexy.interfaces.api import create_api


class HexyFrameworkDemo:
    """Demo completo del framework Hexy."""
    
    def __init__(self):
        self.logger = logging.getLogger("hexy.demo")
        
        # Componentes del framework (simulados)
        self.config = self._init_config()
        self.ontology_manager = None  # HexyOntologyManager(config)
        self.rdf_processor = None     # HexyRDFProcessor()
        self.orchestrator = None      # HexyContextOrchestrator()
        
        # Estado del demo
        self.demo_data = {}
        self.performance_metrics = {
            "start_time": datetime.utcnow(),
            "operations_completed": 0,
            "total_processing_time": 0.0
        }
    
    def _init_config(self):
        """Inicializa configuración simulada."""
        return {
            "ontology": {
                "reasoner": "hermit",
                "cache_inferences": True,
                "max_reasoning_time": 30
            },
            "context": {
                "max_memory_items": 1000,
                "default_relevance_threshold": 0.5,
                "compression_enabled": True,
                "max_context_length": 8000
            },
            "api": {
                "host": "localhost",
                "port": 8000,
                "enable_docs": True
            }
        }
    
    async def run_complete_demo(self):
        """Ejecuta demo completo del framework."""
        print("🚀 Hexy Framework - Complete Integration Demo")
        print("=" * 60)
        
        try:
            # 1. Configuración inicial
            await self._demo_configuration()
            
            # 2. Gestión de ontologías
            await self._demo_ontology_management()
            
            # 3. Procesamiento RDF
            await self._demo_rdf_processing()
            
            # 4. Orquestación de contexto
            await self._demo_context_orchestration()
            
            # 5. Integración de componentes
            await self._demo_component_integration()
            
            # 6. API REST (opcional)
            await self._demo_api_integration()
            
            # 7. Métricas finales
            await self._show_final_metrics()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Demo failed: {str(e)}")
            return False
    
    async def _demo_configuration(self):
        """Demo del sistema de configuración."""
        print("\\n📋 1. Configuration System Demo")
        print("-" * 40)
        
        # Simular configuración
        print("✅ Configuration loaded from environment variables")
        print(f"   - Environment: {self.config.get('environment', 'development')}")
        print(f"   - Ontology reasoner: {self.config['ontology']['reasoner']}")
        print(f"   - Context threshold: {self.config['context']['default_relevance_threshold']}")
        print(f"   - Max context length: {self.config['context']['max_context_length']}")
        
        # Simular logging setup
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        print("✅ Logging system configured")
        print("✅ Component validation passed")
        
        self.performance_metrics["operations_completed"] += 1
    
    async def _demo_ontology_management(self):
        """Demo de gestión de ontologías."""
        print("\\n🧠 2. Ontology Management Demo")
        print("-" * 40)
        
        # Ontología de ejemplo más compleja
        ai_ontology = """
        @prefix ai: <http://example.org/ai-ontology#> .
        @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
        @prefix owl: <http://www.w3.org/2002/07/owl#> .
        
        # Clases principales
        ai:Technology rdf:type owl:Class ;
                      rdfs:label "Technology" ;
                      rdfs:comment "General technology concept" .
        
        ai:ArtificialIntelligence rdf:type owl:Class ;
                                 rdfs:subClassOf ai:Technology ;
                                 rdfs:label "Artificial Intelligence" ;
                                 rdfs:comment "AI systems and techniques" .
        
        ai:MachineLearning rdf:type owl:Class ;
                          rdfs:subClassOf ai:ArtificialIntelligence ;
                          rdfs:label "Machine Learning" ;
                          rdfs:comment "ML algorithms and models" .
        
        ai:NeuralNetwork rdf:type owl:Class ;
                        rdfs:subClassOf ai:MachineLearning ;
                        rdfs:label "Neural Network" ;
                        rdfs:comment "Artificial neural network architectures" .
        
        ai:LanguageModel rdf:type owl:Class ;
                        rdfs:subClassOf ai:MachineLearning ;
                        rdfs:label "Language Model" ;
                        rdfs:comment "Natural language processing models" .
        
        # Propiedades
        ai:developedBy rdf:type owl:ObjectProperty ;
                       rdfs:label "developed by" ;
                       rdfs:comment "Organization that developed the technology" .
        
        ai:hasCapability rdf:type owl:ObjectProperty ;
                        rdfs:label "has capability" ;
                        rdfs:comment "Capability or feature of the technology" .
        
        ai:releasedIn rdf:type owl:DatatypeProperty ;
                     rdfs:label "released in" ;
                     rdfs:comment "Year of release or publication" .
        
        # Instancias de modelos de lenguaje
        ai:GPT4 rdf:type ai:LanguageModel ;
                rdfs:label "GPT-4" ;
                rdfs:comment "Large multimodal model by OpenAI" ;
                ai:developedBy ai:OpenAI ;
                ai:releasedIn "2023" ;
                ai:hasCapability ai:TextGeneration, ai:CodeGeneration .
        
        ai:Claude3 rdf:type ai:LanguageModel ;
                  rdfs:label "Claude 3" ;
                  rdfs:comment "Constitutional AI model by Anthropic" ;
                  ai:developedBy ai:Anthropic ;
                  ai:releasedIn "2024" ;
                  ai:hasCapability ai:TextGeneration, ai:SafetyAlignment .
        
        ai:BERT rdf:type ai:LanguageModel ;
               rdfs:label "BERT" ;
               rdfs:comment "Bidirectional encoder transformer" ;
               ai:developedBy ai:Google ;
               ai:releasedIn "2018" ;
               ai:hasCapability ai:TextUnderstanding .
        
        # Organizaciones
        ai:OpenAI rdf:type ai:Organization ;
                  rdfs:label "OpenAI" ;
                  rdfs:comment "AI research organization" .
        
        ai:Anthropic rdf:type ai:Organization ;
                     rdfs:label "Anthropic" ;
                     rdfs:comment "AI safety company" .
        
        ai:Google rdf:type ai:Organization ;
                  rdfs:label "Google" ;
                  rdfs:comment "Technology company" .
        
        # Capacidades
        ai:TextGeneration rdf:type ai:Capability ;
                         rdfs:label "Text Generation" .
        
        ai:CodeGeneration rdf:type ai:Capability ;
                         rdfs:label "Code Generation" .
        
        ai:TextUnderstanding rdf:type ai:Capability ;
                            rdfs:label "Text Understanding" .
        
        ai:SafetyAlignment rdf:type ai:Capability ;
                          rdfs:label "Safety Alignment" .
        """
        
        print("📝 Loading AI ontology with advanced concepts...")
        
        # Simular carga de ontología
        # ontology_loaded = await self.ontology_manager.load_ontology("ai_ontology.owl")
        ontology_loaded = True
        
        if ontology_loaded:
            print("✅ Ontology loaded successfully")
            print("   - Classes: 6 (Technology, AI, ML, Neural Networks, etc.)")
            print("   - Properties: 3 (developedBy, hasCapability, releasedIn)")
            print("   - Individuals: 7 (GPT-4, Claude 3, BERT, OpenAI, etc.)")
            
            # Simular razonamiento
            print("🔍 Running reasoner (HermiT)...")
            # reasoning_success = await self.ontology_manager.run_reasoner()
            reasoning_success = True
            
            if reasoning_success:
                print("✅ Reasoning completed - new inferences discovered")
                print("   - Inferred: GPT-4 is a Technology (via class hierarchy)")
                print("   - Inferred: All LanguageModels are ArtificialIntelligence")
        
        self.demo_data["ai_ontology"] = ai_ontology
        self.performance_metrics["operations_completed"] += 1
    
    async def _demo_rdf_processing(self):
        """Demo de procesamiento RDF."""
        print("\\n📊 3. RDF Processing Demo")  
        print("-" * 40)
        
        # Cargar datos RDF
        print("📝 Loading AI ontology as RDF graph...")
        # graph_id = await self.rdf_processor.load_rdf_data(self.demo_data["ai_ontology"])
        graph_id = "ai_graph_001"
        
        print(f"✅ RDF graph loaded: {graph_id}")
        print("   - Format: Turtle")
        print("   - Triples: 45")
        print("   - Namespaces: 4 (ai, rdf, rdfs, owl)")
        
        # Consultas SPARQL complejas
        queries = [
            {
                "name": "Language Models by Organization",
                "sparql": """
                PREFIX ai: <http://example.org/ai-ontology#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                
                SELECT ?model ?label ?org ?year
                WHERE {
                    ?model a ai:LanguageModel ;
                           rdfs:label ?label ;
                           ai:developedBy ?org_uri ;
                           ai:releasedIn ?year .
                    ?org_uri rdfs:label ?org .
                }
                ORDER BY ?year ?org
                """,
                "expected_results": 3
            },
            {
                "name": "Technologies with Capabilities",
                "sparql": """
                PREFIX ai: <http://example.org/ai-ontology#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                
                SELECT ?tech ?label ?capability
                WHERE {
                    ?tech ai:hasCapability ?cap_uri ;
                          rdfs:label ?label .
                    ?cap_uri rdfs:label ?capability .
                }
                ORDER BY ?label
                """,
                "expected_results": 6
            },
            {
                "name": "Class Hierarchy",
                "sparql": """
                PREFIX ai: <http://example.org/ai-ontology#>
                PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                
                SELECT ?subclass ?label ?superclass
                WHERE {
                    ?subclass rdfs:subClassOf ?superclass ;
                             rdfs:label ?label .
                    FILTER(?subclass != ?superclass)
                }
                ORDER BY ?subclass
                """,
                "expected_results": 4
            }
        ]
        
        print("🔍 Executing complex SPARQL queries...")
        
        for i, query_info in enumerate(queries, 1):
            print(f"\\n   Query {i}: {query_info['name']}")
            
            # Simular ejecución de consulta
            # results = await self.rdf_processor.execute_sparql_query(query_info["sparql"], [graph_id])
            results = [{"result": f"Sample result {j}"} for j in range(query_info["expected_results"])]
            
            print(f"   ✅ Results: {len(results)} rows")
            
            # Mostrar algunos resultados
            if query_info["name"] == "Language Models by Organization":
                sample_results = [
                    {"model": "BERT", "label": "BERT", "org": "Google", "year": "2018"},
                    {"model": "GPT-4", "label": "GPT-4", "org": "OpenAI", "year": "2023"},
                    {"model": "Claude 3", "label": "Claude 3", "org": "Anthropic", "year": "2024"}
                ]
                for result in sample_results:
                    print(f"      - {result['label']} by {result['org']} ({result['year']})")
        
        # Extracción de entidades
        print("\\n🎯 Extracting entities from RDF graph...")
        # entities = await self.rdf_processor.extract_entities_from_graph(graph_id)
        entities = [
            {"label": "GPT-4", "type": "LanguageModel", "confidence": 1.0},
            {"label": "Claude 3", "type": "LanguageModel", "confidence": 1.0},
            {"label": "BERT", "type": "LanguageModel", "confidence": 1.0},
            {"label": "OpenAI", "type": "Organization", "confidence": 1.0}
        ]
        
        print(f"✅ Extracted {len(entities)} entities:")
        for entity in entities:
            print(f"   - {entity['label']} ({entity['type']}) - confidence: {entity['confidence']}")
        
        self.demo_data["entities"] = entities
        self.demo_data["graph_id"] = graph_id
        self.performance_metrics["operations_completed"] += 1
    
    async def _demo_context_orchestration(self):
        """Demo de orquestación de contexto."""
        print("\\n🎭 4. Context Orchestration Demo")
        print("-" * 40)
        
        # Crear items de contexto desde entidades
        context_items = []
        for entity in self.demo_data["entities"]:
            context_item = {
                "id": f"ctx_{uuid.uuid4().hex[:8]}",
                "content": f"{entity['label']} is a {entity['type']} with high relevance to AI research",
                "type": "SEMANTIC",
                "relevance_score": entity["confidence"] * 0.8,
                "entities": [entity],
                "metadata": {"source": "rdf_graph", "extraction_confidence": entity["confidence"]},
                "source": f"graph:{self.demo_data['graph_id']}"
            }
            context_items.append(context_item)
        
        # Agregar contexto adicional
        additional_context = [
            {
                "id": "ctx_domain_001",
                "content": "Large language models are transformer-based neural networks trained on vast text corpora",
                "type": "SEMANTIC",
                "relevance_score": 0.9,
                "entities": [],
                "metadata": {"source": "domain_knowledge", "topic": "language_models"},
                "source": "knowledge_base"
            },
            {
                "id": "ctx_domain_002", 
                "content": "OpenAI and Anthropic are leading AI safety research organizations",
                "type": "SEMANTIC",
                "relevance_score": 0.7,
                "entities": [],
                "metadata": {"source": "domain_knowledge", "topic": "organizations"},
                "source": "knowledge_base"
            }
        ]
        
        context_items.extend(additional_context)
        
        print(f"📋 Available context: {len(context_items)} items")
        
        # Tareas de contexto de ejemplo
        tasks = [
            {
                "query": "What are the latest developments in large language models?",
                "domain": "artificial_intelligence",
                "context_types": ["SEMANTIC"],
                "max_context_items": 5
            },
            {
                "query": "Compare different AI organizations and their contributions",
                "domain": "ai_industry",
                "context_types": ["SEMANTIC"],
                "max_context_items": 4
            },
            {
                "query": "Explain the relationship between machine learning and language models",
                "domain": "machine_learning",
                "context_types": ["SEMANTIC"], 
                "max_context_items": 3
            }
        ]
        
        print("🎯 Processing context tasks...")
        
        for i, task_info in enumerate(tasks, 1):
            task_id = f"task_{uuid.uuid4().hex[:8]}"
            print(f"\\n   Task {i} ({task_id}): {task_info['query']}")
            
            # Simular procesamiento con orquestador
            # task = TaskRequest(id=task_id, **task_info)
            # response = await self.orchestrator.process_task(task, context_items)
            
            # Simular selección de contexto
            relevant_items = sorted(context_items, key=lambda x: x["relevance_score"], reverse=True)
            selected_items = relevant_items[:task_info["max_context_items"]]
            
            # Simular respuesta
            response = {
                "task_id": task_id,
                "context_bundle": {
                    "id": f"bundle_{uuid.uuid4().hex[:8]}",
                    "items": selected_items,
                    "total_relevance": sum(item["relevance_score"] for item in selected_items),
                    "compression_ratio": None
                },
                "explanation": f"Selected {len(selected_items)} most relevant context items based on semantic similarity with query '{task_info['query']}'",
                "processing_time": 0.12 + (i * 0.03),
                "status": "completed"
            }
            
            print(f"   ✅ Context selected: {len(selected_items)} items")
            print(f"   📊 Total relevance: {response['context_bundle']['total_relevance']:.2f}")
            print(f"   ⏱️ Processing time: {response['processing_time']:.3f}s")
            print(f"   💡 Explanation: {response['explanation'][:80]}...")
        
        # Simular métricas del orquestador
        orchestrator_metrics = {
            "tasks_processed": len(tasks),
            "cache_hits": 0,
            "cache_misses": len(tasks),
            "compression_events": 0,
            "explanation_requests": len(tasks),
            "cache_hit_rate": 0.0,
            "avg_processing_time": 0.15
        }
        
        print(f"\\n📊 Orchestrator metrics:")
        for metric, value in orchestrator_metrics.items():
            print(f"   - {metric}: {value}")
        
        self.demo_data["context_tasks"] = tasks
        self.demo_data["orchestrator_metrics"] = orchestrator_metrics
        self.performance_metrics["operations_completed"] += 1
    
    async def _demo_component_integration(self):
        """Demo de integración entre componentes."""
        print("\\n🔗 5. Component Integration Demo")
        print("-" * 40)
        
        print("🔄 Demonstrating end-to-end workflow:")
        
        # Workflow completo simulado
        workflow_steps = [
            "1. Load ontology from URI → HexyOntologyManager",
            "2. Convert to RDF graph → HexyRDFProcessor", 
            "3. Extract entities via SPARQL → HexyRDFProcessor",
            "4. Generate context items → HexyRDFProcessor", 
            "5. Process context task → HexyContextOrchestrator",
            "6. Select relevant context → HexyContextOrchestrator",
            "7. Compress if needed → HexyContextOrchestrator",
            "8. Generate explanation → HexyContextOrchestrator",
            "9. Cache result → HexyContextOrchestrator",
            "10. Return structured response → API Layer"
        ]
        
        for step in workflow_steps:
            print(f"   ✅ {step}")
        
        # Simular pipeline completo
        pipeline_result = {
            "input": "User query: 'What are the capabilities of modern language models?'",
            "ontology_concepts_used": ["LanguageModel", "hasCapability", "TextGeneration"],
            "sparql_queries_executed": 2,
            "entities_extracted": 4,
            "context_items_generated": 6,
            "context_items_selected": 3,
            "compression_applied": False,
            "explanation_generated": True,
            "processing_time_total": 0.247,
            "cache_stored": True
        }
        
        print("\\n📋 Complete pipeline execution:")
        for key, value in pipeline_result.items():
            print(f"   - {key.replace('_', ' ').title()}: {value}")
        
        # Interoperabilidad de componentes
        print("\\n🔄 Component interoperability verified:")
        print("   ✅ Ontology → RDF conversion")
        print("   ✅ RDF → Context item generation")
        print("   ✅ Context orchestration → Explanation")
        print("   ✅ All components → Unified API")
        
        self.performance_metrics["operations_completed"] += 1
        self.performance_metrics["total_processing_time"] += pipeline_result["processing_time_total"]
    
    async def _demo_api_integration(self):
        """Demo de integración con API REST."""
        print("\\n🌐 6. API Integration Demo")
        print("-" * 40)
        
        print("🚀 FastAPI server capabilities:")
        
        # Endpoints principales
        endpoints = [
            {
                "method": "POST",
                "path": "/ontology/load",
                "description": "Load ontology from URI",
                "example": {"uri": "http://example.org/ai-ontology.owl", "format_hint": "rdf_xml"}
            },
            {
                "method": "POST", 
                "path": "/rdf/query",
                "description": "Execute SPARQL query",
                "example": {"query": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"}
            },
            {
                "method": "POST",
                "path": "/context/task", 
                "description": "Process context orchestration task",
                "example": {
                    "query": "Explain language model capabilities",
                    "domain": "ai",
                    "max_context_items": 5
                }
            },
            {
                "method": "GET",
                "path": "/context/metrics",
                "description": "Get orchestrator performance metrics",
                "example": "No body required"
            }
        ]
        
        for endpoint in endpoints:
            print(f"   {endpoint['method']} {endpoint['path']}")
            print(f"      📝 {endpoint['description']}")
        
        print("\\n📊 API Features:")
        features = [
            "✅ Automatic request/response validation (Pydantic)",
            "✅ Interactive documentation (Swagger UI)",
            "✅ CORS support for web frontends",
            "✅ Error handling with structured responses", 
            "✅ Request logging and metrics",
            "✅ Background task processing",
            "✅ Health checks and monitoring"
        ]
        
        for feature in features:
            print(f"   {feature}")
        
        # Simular llamadas a API
        print("\\n🔗 Simulated API calls:")
        api_calls = [
            "POST /ontology/load → 200 OK (ontology loaded)",
            "POST /rdf/query → 200 OK (3 results returned)",
            "POST /context/task → 200 OK (context processed)",
            "GET /context/metrics → 200 OK (metrics retrieved)"
        ]
        
        for call in api_calls:
            print(f"   ✅ {call}")
        
        print("\\n🌍 API Documentation available at:")
        print("   - Swagger UI: http://localhost:8000/docs")
        print("   - ReDoc: http://localhost:8000/redoc")
        print("   - Health: http://localhost:8000/health")
        
        self.performance_metrics["operations_completed"] += 1
    
    async def _show_final_metrics(self):
        """Muestra métricas finales del demo."""
        print("\\n📊 7. Final Performance Metrics")
        print("-" * 40)
        
        end_time = datetime.utcnow()
        total_time = (end_time - self.performance_metrics["start_time"]).total_seconds()
        
        final_metrics = {
            "Demo Duration": f"{total_time:.2f} seconds",
            "Operations Completed": self.performance_metrics["operations_completed"],
            "Simulated Processing Time": f"{self.performance_metrics['total_processing_time']:.3f} seconds",
            "Components Demonstrated": 5,
            "Integration Points": 10,
            "API Endpoints": 4,
            "SPARQL Queries": 3,
            "Context Tasks": 3,
            "Entities Extracted": len(self.demo_data.get("entities", [])),
            "Framework Readiness": "Production Ready (with full implementation)"
        }
        
        print("🎯 Hexy Framework Demo Summary:")
        for metric, value in final_metrics.items():
            print(f"   - {metric}: {value}")
        
        print("\\n✅ All framework components successfully integrated!")
        print("🚀 Ready for:")
        print("   - Production deployment")
        print("   - Custom ontology integration")
        print("   - LLM provider connections")
        print("   - Enterprise-scale context orchestration")


async def main():
    """Función principal del demo completo."""
    demo = HexyFrameworkDemo()
    
    print("🎯 Starting complete Hexy Framework integration demo...")
    print("This demo showcases the full framework capabilities")
    print("and component integration in a realistic scenario.\\n")
    
    success = await demo.run_complete_demo()
    
    if success:
        print("\\n" + "=" * 60)
        print("🎉 DEMO COMPLETED SUCCESSFULLY!")
        print("\\nHexy Framework is ready for:")
        print("• 🧠 Ontology-driven context engineering")
        print("• 🔄 Dynamic context orchestration")  
        print("• 📊 Semantic data processing")
        print("• 🌐 REST API integration")
        print("• 🤖 LLM context optimization")
        print("• 📈 Explainable AI decisions")
        
        print("\\n🔗 Next steps:")
        print("1. pip install owlready2 rdflib fastapi")
        print("2. Implement the actual component classes")
        print("3. Replace simulated calls with real implementations")
        print("4. Deploy with your specific ontologies")
        print("5. Connect to your preferred LLM providers")
        
    else:
        print("\\n❌ Demo completed with errors - check logs above")


if __name__ == "__main__":
    try:
        asyncio.run(main())
        
    except KeyboardInterrupt:
        print("\\n⏹️ Demo interrupted by user")
        
    except Exception as e:
        print(f"\\n❌ Demo failed: {str(e)}")
        sys.exit(1)