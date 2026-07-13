"""
Gestor de ontologías usando Owlready2.
Implementa la interface OntologyManager siguiendo principio DRY.
"""
import asyncio
from typing import List, Dict, Any, Optional, Set
from pathlib import Path
from urllib.parse import urlparse
import uuid

try:
    import owlready2
    from owlready2 import *
except ImportError:
    raise ImportError("owlready2 is required. Install with: pip install owlready2")


class HexyOntologyManager:
    """
    Gestor principal de ontologías usando Owlready2.
    
    Características:
    - Carga de ontologías OWL, RDF/XML, Turtle
    - Razonamiento automático con HermiT/Pellet
    - Cache de inferencias para performance
    - Consultas SPARQL nativas
    - Enlazado de entidades con confidence scoring
    """
    
    def __init__(self, config=None):
        self.config = config or {"reasoner": "hermit", "max_reasoning_time": 30}
        self._ontologies: Dict[str, owlready2.Ontology] = {}
        self._world = owlready2.World()
        self._reasoner_cache: Dict[str, Any] = {}
        
        # Configurar Owlready2
        self._configure_owlready()
    
    def _configure_owlready(self) -> None:
        """Configura Owlready2 según la configuración de Hexy."""
        reasoner_map = {
            'hermit': 'HermiT',
            'pellet': 'Pellet', 
            'fact++': 'FaCT++',
            'jfact': 'JFact'
        }
        
        self._default_reasoner = reasoner_map.get(
            self.config.get("reasoner", "hermit"), 'HermiT'
        )
        
        owlready2.REASONER_TIMEOUT = self.config.get("max_reasoning_time", 30)
    
    async def load_ontology(self, uri: str) -> bool:
        """
        Carga una ontología desde URI local o remota.
        
        Args:
            uri: URI de la ontología (file://, http://, https://)
            
        Returns:
            bool: True si la carga fue exitosa
        """
        try:
            parsed_uri = urlparse(uri)
            
            if parsed_uri.scheme in ['http', 'https']:
                ontology = await self._load_remote_ontology(uri)
            elif parsed_uri.scheme == 'file' or not parsed_uri.scheme:
                file_path = Path(parsed_uri.path) if parsed_uri.path else Path(uri)
                ontology = await self._load_local_ontology(file_path)
            else:
                raise Exception(f"Unsupported URI scheme: {parsed_uri.scheme}")
            
            # Almacenar ontología
            ontology_id = self._generate_ontology_id(uri)
            self._ontologies[ontology_id] = ontology
            
            print(f"✅ Ontology loaded: {ontology_id}")
            return True
                
        except Exception as e:
            print(f"❌ Failed to load ontology from {uri}: {str(e)}")
            return False
    
    async def _load_local_ontology(self, file_path: Path) -> owlready2.Ontology:
        """Carga ontología desde archivo local."""
        if not file_path.exists():
            raise Exception(f"Ontology file not found: {file_path}")
        
        loop = asyncio.get_event_loop()
        
        def _load():
            format_map = {
                '.owl': 'rdfxml',
                '.rdf': 'rdfxml', 
                '.xml': 'rdfxml',
                '.ttl': 'turtle',
                '.turtle': 'turtle',
                '.n3': 'n3'
            }
            
            file_format = format_map.get(file_path.suffix.lower(), 'rdfxml')
            ontology = self._world.get_ontology(file_path.as_uri())
            
            if file_format == 'turtle':
                ontology.load(format='turtle')
            elif file_format == 'n3':
                ontology.load(format='n3')
            else:
                ontology.load()
                
            return ontology
        
        return await loop.run_in_executor(None, _load)
    
    async def _load_remote_ontology(self, uri: str) -> owlready2.Ontology:
        """Carga ontología desde URI remota."""
        loop = asyncio.get_event_loop()
        
        def _load():
            ontology = self._world.get_ontology(uri)
            ontology.load()
            return ontology
        
        return await loop.run_in_executor(None, _load)
    
    def _generate_ontology_id(self, uri: str) -> str:
        """Genera ID único para ontología basado en URI."""
        return f"onto_{hash(uri) & 0xFFFFFF:06x}"
    
    async def query_entities(self, query: str) -> List[Dict]:
        """
        Ejecuta consulta SPARQL y retorna entidades.
        """
        try:
            if not self._ontologies:
                raise Exception("No ontologies loaded")
            
            loop = asyncio.get_event_loop()
            
            def _execute_query():
                combined_graph = owlready2.default_world.as_rdflib_graph()
                sparql_results = combined_graph.query(query)
                
                results = []
                for row in sparql_results:
                    if len(row) >= 1:
                        subject = str(row[0])
                        label = subject.split('/')[-1].split('#')[-1]
                        
                        entity = {
                            "id": str(uuid.uuid4()),
                            "label": label,
                            "type": "owl:NamedIndividual",
                            "uri": subject,
                            "confidence": 1.0,
                            "source": "ontology"
                        }
                        results.append(entity)
                
                return results
            
            entities = await loop.run_in_executor(None, _execute_query)
            return entities
                
        except Exception as e:
            print(f"❌ Query execution failed: {str(e)}")
            return []
    
    async def run_reasoner(self) -> bool:
        """Ejecuta razonamiento sobre las ontologías cargadas."""
        try:
            if not self._ontologies:
                print("⚠️ No ontologies loaded for reasoning")
                return True
            
            loop = asyncio.get_event_loop()
            
            def _run_reasoning():
                try:
                    if self._default_reasoner == 'HermiT':
                        owlready2.sync_reasoner_hermit(self._world)
                    elif self._default_reasoner == 'Pellet':
                        owlready2.sync_reasoner_pellet(self._world)
                    else:
                        owlready2.sync_reasoner_hermit(self._world)
                    
                    return True
                    
                except Exception as e:
                    raise Exception(f"Reasoner execution failed: {str(e)}")
            
            success = await loop.run_in_executor(None, _run_reasoning)
            
            if success:
                print(f"✅ Reasoning completed with {self._default_reasoner}")
            
            return success
                
        except Exception as e:
            print(f"❌ Reasoning failed: {str(e)}")
            return False
    
    def get_loaded_ontologies(self) -> Dict[str, Dict[str, Any]]:
        """Retorna información de ontologías cargadas."""
        result = {}
        
        for ont_id, ontology in self._ontologies.items():
            try:
                result[ont_id] = {
                    "base_iri": str(ontology.base_iri),
                    "classes_count": len(list(ontology.classes())),
                    "properties_count": len(list(ontology.properties())),
                    "individuals_count": len(list(ontology.individuals())),
                    "imports": [str(imp) for imp in ontology.imported_ontologies]
                }
            except:
                result[ont_id] = {"error": "Could not retrieve ontology info"}
        
        return result
    
    def __repr__(self) -> str:
        return f"HexyOntologyManager(ontologies={len(self._ontologies)}, reasoner={self._default_reasoner})"