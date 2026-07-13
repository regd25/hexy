"""
Procesador RDF usando RDFLib.
Complementa OntologyManager con capacidades específicas de RDF/SPARQL.
"""
import asyncio
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
import uuid

try:
    import rdflib
    from rdflib import Graph, Namespace, Literal, URIRef
    from rdflib.namespace import RDF, RDFS, OWL, XSD
except ImportError:
    raise ImportError("rdflib is required. Install with: pip install rdflib")


class HexyRDFProcessor:
    """
    Procesador RDF especializado usando RDFLib.
    
    Características:
    - Parsing de múltiples formatos RDF
    - Consultas SPARQL optimizadas
    - Serialización en diferentes formatos
    - Extracción de triplas contextuales
    """
    
    def __init__(self):
        self._graphs: Dict[str, rdflib.Graph] = {}
        self._prepared_queries: Dict[str, Any] = {}
        
        # Namespaces comunes
        self.namespaces = {
            'rdf': RDF,
            'rdfs': RDFS,
            'owl': OWL,
            'xsd': XSD,
            'hexy': Namespace('http://hexy.framework/ontology/'),
            'schema': Namespace('https://schema.org/'),
        }
    
    async def load_rdf_data(
        self, 
        source: Union[str, Path], 
        format_hint: Optional[str] = None,
        graph_id: Optional[str] = None
    ) -> str:
        """
        Carga datos RDF desde archivo o contenido.
        
        Args:
            source: Path local, URI remota o contenido RDF
            format_hint: Formato esperado
            graph_id: ID para el grafo (auto-generado si no se provee)
            
        Returns:
            str: ID del grafo cargado
        """
        try:
            # Generar ID para el grafo
            graph_id = graph_id or f"graph_{uuid.uuid4().hex[:8]}"
            
            # Crear nuevo grafo
            graph = rdflib.Graph()
            
            # Registrar namespaces
            for prefix, namespace in self.namespaces.items():
                graph.bind(prefix, namespace)
            
            # Determinar formato
            rdf_format = self._detect_format(source, format_hint)
            
            # Cargar datos
            loop = asyncio.get_event_loop()
            
            def _load_data():
                # Verificar si es un archivo existente
                if isinstance(source, (str, Path)) and Path(source).exists():
                    graph.parse(str(source), format=rdf_format)
                # Verificar si es una URI remota
                elif isinstance(source, str) and source.startswith(('http://', 'https://', 'file://')):
                    graph.parse(source, format=rdf_format)
                else:
                    # Asumir que es contenido RDF directo
                    graph.parse(data=str(source), format=rdf_format)
                
                return len(graph)
            
            triples_count = await loop.run_in_executor(None, _load_data)
            
            # Almacenar grafo
            self._graphs[graph_id] = graph
            
            print(f"✅ RDF data loaded: {graph_id} with {triples_count} triples")
            return graph_id
                
        except Exception as e:
            print(f"❌ Failed to load RDF data: {str(e)}")
            raise
    
    def _detect_format(self, source: Union[str, Path], hint: Optional[str]) -> str:
        """Detecta formato RDF basado en extensión o hint."""
        if hint:
            format_map = {
                "RDF_XML": 'xml',
                "TURTLE": 'turtle',
                "N3": 'n3',
                "JSON_LD": 'json-ld'
            }
            return format_map.get(hint, 'xml')
        
        # Auto-detectar por extensión o contenido
        if isinstance(source, (str, Path)):
            source_path = Path(str(source))
            extension = source_path.suffix.lower()
            
            extension_map = {
                '.rdf': 'xml',
                '.xml': 'xml',
                '.owl': 'xml',
                '.ttl': 'turtle',
                '.turtle': 'turtle',
                '.n3': 'n3',
                '.nt': 'nt'
            }
            
            detected_format = extension_map.get(extension, 'turtle')
            return detected_format
        
        # Si es contenido string, intentar detectar por prefijos
        content = str(source)
        if content.strip().startswith('@prefix') or content.strip().startswith('PREFIX'):
            return 'turtle'
        elif '<rdf:RDF' in content or '<?xml' in content:
            return 'xml'
        
        return 'turtle'  # Default
    
    async def execute_sparql_query(
        self,
        query: str,
        graph_ids: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Ejecuta consulta SPARQL sobre uno o más grafos.
        
        Args:
            query: Consulta SPARQL
            graph_ids: IDs de grafos a consultar (todos si None)
            
        Returns:
            Lista de resultados como diccionarios
        """
        try:
            # Seleccionar grafos
            target_graphs = []
            if graph_ids:
                for gid in graph_ids:
                    if gid not in self._graphs:
                        raise Exception(f"Graph {gid} not found")
                    target_graphs.append(self._graphs[gid])
            else:
                target_graphs = list(self._graphs.values())
            
            if not target_graphs:
                raise Exception("No graphs available for querying")
            
            # Ejecutar consulta
            loop = asyncio.get_event_loop()
            
            def _execute_query():
                results = []
                
                # Si hay múltiples grafos, crear un grafo conjunto
                if len(target_graphs) == 1:
                    query_graph = target_graphs[0]
                else:
                    query_graph = rdflib.Graph()
                    for g in target_graphs:
                        query_graph += g
                
                sparql_results = query_graph.query(query)
                
                # Convertir resultados
                for row in sparql_results:
                    result_dict = {}
                    for var, value in zip(sparql_results.vars, row):
                        result_dict[str(var)] = self._rdf_term_to_value(value)
                    results.append(result_dict)
                
                return results
            
            results = await loop.run_in_executor(None, _execute_query)
            
            print(f"✅ SPARQL query executed: {len(results)} results")
            return results
                
        except Exception as e:
            print(f"❌ SPARQL query failed: {str(e)}")
            return []
    
    def _rdf_term_to_value(self, term) -> Union[str, int, float, bool, None]:
        """Convierte término RDF a valor Python."""
        if term is None:
            return None
        elif isinstance(term, Literal):
            if term.datatype == XSD.integer:
                return int(term)
            elif term.datatype in [XSD.float, XSD.double]:
                return float(term)
            elif term.datatype == XSD.boolean:
                return bool(term)
            else:
                return str(term)
        elif isinstance(term, URIRef):
            return str(term)
        else:
            return str(term)
    
    async def extract_entities_from_graph(
        self, 
        graph_id: str,
        entity_types: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Extrae entidades de un grafo RDF.
        """
        try:
            if graph_id not in self._graphs:
                raise Exception(f"Graph {graph_id} not found")
            
            # Construir consulta SPARQL para extraer entidades
            type_filter = ""
            if entity_types:
                type_values = " ".join([f"<{t}>" for t in entity_types])
                type_filter = f"FILTER (?type IN ({type_values}))"
            
            query = f"""
            SELECT DISTINCT ?entity ?type ?label ?comment
            WHERE {{
                ?entity a ?type .
                {type_filter}
                OPTIONAL {{ ?entity rdfs:label ?label }}
                OPTIONAL {{ ?entity rdfs:comment ?comment }}
            }}
            ORDER BY ?entity
            """
            
            results = await self.execute_sparql_query(query, [graph_id])
            
            # Convertir resultados a entidades
            entities = []
            for result in results:
                entity = {
                    "id": str(uuid.uuid4()),
                    "label": result.get('label', self._extract_local_name(result['entity'])),
                    "type": result['type'],
                    "uri": result['entity'],
                    "confidence": 1.0,
                    "properties": {
                        'comment': result.get('comment')
                    } if result.get('comment') else {},
                    "source": f"rdf_graph:{graph_id}"
                }
                entities.append(entity)
            
            print(f"✅ Extracted {len(entities)} entities from graph {graph_id}")
            return entities
                
        except Exception as e:
            print(f"❌ Failed to extract entities: {str(e)}")
            return []
    
    def _extract_local_name(self, uri: str) -> str:
        """Extrae nombre local de una URI."""
        if '#' in uri:
            return uri.split('#')[-1]
        elif '/' in uri:
            return uri.split('/')[-1]
        else:
            return uri
    
    async def create_context_items_from_triples(
        self,
        graph_id: str,
        subject_uri: str,
        max_depth: int = 2
    ) -> List[Dict]:
        """
        Crea items de contexto basados en triplas RDF relacionadas.
        """
        try:
            if graph_id not in self._graphs:
                raise Exception(f"Graph {graph_id} not found")
            
            context_items = []
            
            # Consultar triplas donde el sujeto aparece
            query = f"""
            SELECT ?predicate ?object ?objectLabel
            WHERE {{
                <{subject_uri}> ?predicate ?object .
                OPTIONAL {{ ?object rdfs:label ?objectLabel }}
            }}
            """
            
            results = await self.execute_sparql_query(query, [graph_id])
            
            if results:
                # Crear contexto textual a partir de las triplas
                triples_text = []
                related_entities = []
                
                for result in results:
                    predicate = self._extract_local_name(result['predicate'])
                    obj = result['object']
                    obj_label = result.get('objectLabel', self._extract_local_name(obj))
                    
                    triples_text.append(f"{predicate}: {obj_label}")
                    
                    # Agregar objeto como entidad relacionada si es una URI
                    if str(obj).startswith('http'):
                        entity = {
                            "id": str(uuid.uuid4()),
                            "label": obj_label,
                            "type": "owl:NamedIndividual",
                            "uri": str(obj),
                            "confidence": 0.9,
                            "source": f"rdf_graph:{graph_id}"
                        }
                        related_entities.append(entity)
                
                # Crear item de contexto
                if triples_text:
                    context_item = {
                        "id": f"ctx_{uuid.uuid4().hex[:8]}",
                        "content": f"Entity {self._extract_local_name(subject_uri)}: " + "; ".join(triples_text),
                        "type": "SEMANTIC",
                        "relevance_score": 0.8,
                        "entities": related_entities,
                        "metadata": {
                            "subject_uri": subject_uri,
                            "graph_id": graph_id,
                            "depth": max_depth,
                            "triples_count": len(results)
                        },
                        "source": f"rdf_processor:{graph_id}"
                    }
                    context_items.append(context_item)
            
            print(f"✅ Created {len(context_items)} context items")
            return context_items
                
        except Exception as e:
            print(f"❌ Failed to create context items: {str(e)}")
            return []
    
    async def serialize_graph(
        self, 
        graph_id: str, 
        format: str = "TURTLE"
    ) -> str:
        """Serializa un grafo en el formato especificado."""
        try:
            if graph_id not in self._graphs:
                raise Exception(f"Graph {graph_id} not found")
            
            graph = self._graphs[graph_id]
            
            format_map = {
                "RDF_XML": 'xml',
                "TURTLE": 'turtle',
                "N3": 'n3',
                "JSON_LD": 'json-ld'
            }
            
            rdf_format = format_map.get(format, 'turtle')
            
            loop = asyncio.get_event_loop()
            serialized = await loop.run_in_executor(
                None, 
                lambda: graph.serialize(format=rdf_format)
            )
            
            return serialized
                
        except Exception as e:
            print(f"❌ Failed to serialize graph: {str(e)}")
            return ""
    
    def get_graph_stats(self, graph_id: str) -> Dict[str, Any]:
        """Obtiene estadísticas de un grafo."""
        if graph_id not in self._graphs:
            return {}
        
        graph = self._graphs[graph_id]
        
        return {
            "triples_count": len(graph),
            "namespaces": dict(graph.namespaces()),
            "subjects_count": len(set(graph.subjects())),
            "predicates_count": len(set(graph.predicates())),
            "objects_count": len(set(graph.objects()))
        }
    
    def list_graphs(self) -> Dict[str, Dict[str, Any]]:
        """Lista todos los grafos cargados con estadísticas."""
        return {
            graph_id: self.get_graph_stats(graph_id)
            for graph_id in self._graphs.keys()
        }
    
    async def clear_graph(self, graph_id: str) -> bool:
        """Elimina un grafo específico."""
        if graph_id in self._graphs:
            del self._graphs[graph_id]
            print(f"✅ Graph {graph_id} cleared")
            return True
        return False