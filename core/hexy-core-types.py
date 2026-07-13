"""
Tipos de datos básicos para Hexy Framework.
Definiciones centralizadas siguiendo el principio DRY.
"""
from enum import Enum
from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from pydantic import BaseModel, Field
from pathlib import Path


class SourceType(str, Enum):
    """Tipos de fuentes de datos soportadas."""
    GIT_REPOSITORY = "git_repository"
    API_REST = "api_rest"
    DATABASE = "database"
    FILE_SYSTEM = "file_system"
    ONTOLOGY_FILE = "ontology_file"
    WEB_SCRAPING = "web_scraping"


class OntologyFormat(str, Enum):
    """Formatos de ontologías soportados."""
    OWL = "owl"
    RDF_XML = "rdf_xml"
    TURTLE = "turtle"
    N3 = "n3"
    JSON_LD = "json_ld"


class ContextType(str, Enum):
    """Tipos de contexto que puede gestionar el framework."""
    SEMANTIC = "semantic"          # Basado en ontologías
    CONVERSATIONAL = "conversational"  # Historial de conversación
    TASK_ORIENTED = "task_oriented"    # Específico de tareas
    DOMAIN_SPECIFIC = "domain_specific"  # Dominio experto


class ExplanationType(str, Enum):
    """Tipos de explicación que puede generar el sistema."""
    CAUSAL = "causal"              # Por qué se seleccionó el contexto
    CONTRASTIVE = "contrastive"    # Por qué no otras opciones
    COUNTERFACTUAL = "counterfactual"  # Qué pasaría si...
    TRACE = "trace"                # Rastro del proceso de decisión


# Modelos de datos base
class DataSource(BaseModel):
    """Definición de una fuente de datos."""
    id: str = Field(..., description="Identificador único de la fuente")
    name: str = Field(..., description="Nombre descriptivo")
    type: SourceType = Field(..., description="Tipo de fuente")
    uri: str = Field(..., description="URI o path de la fuente")
    metadata: Dict[str, Any] = Field(default_factory=dict)
    last_updated: Optional[datetime] = None
    is_active: bool = True


class Entity(BaseModel):
    """Entidad extraída del procesamiento semántico."""
    id: str = Field(..., description="Identificador único")
    label: str = Field(..., description="Etiqueta legible")
    type: str = Field(..., description="Tipo de entidad")
    uri: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(ge=0.0, le=1.0, description="Nivel de confianza")
    source: Optional[str] = None


class ContextItem(BaseModel):
    """Item individual de contexto."""
    id: str = Field(..., description="Identificador único")
    content: str = Field(..., description="Contenido textual")
    type: ContextType = Field(..., description="Tipo de contexto")
    relevance_score: float = Field(ge=0.0, le=1.0)
    entities: List[Entity] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    source: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ContextBundle(BaseModel):
    """Conjunto de contexto seleccionado para una tarea."""
    id: str = Field(..., description="Identificador del bundle")
    task_id: str = Field(..., description="ID de la tarea asociada")
    items: List[ContextItem] = Field(..., description="Items de contexto")
    total_relevance: float = Field(ge=0.0)
    compression_ratio: Optional[float] = None
    explanation: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TaskRequest(BaseModel):
    """Solicitud de procesamiento de tarea."""
    id: str = Field(..., description="Identificador único de la tarea")
    query: str = Field(..., description="Consulta o descripción de la tarea")
    domain: Optional[str] = None
    context_types: List[ContextType] = Field(default=[ContextType.SEMANTIC])
    max_context_items: int = Field(default=10, ge=1, le=100)
    require_explanation: bool = Field(default=True)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TaskResponse(BaseModel):
    """Respuesta a una tarea procesada."""
    task_id: str = Field(..., description="ID de la tarea original")
    context_bundle: ContextBundle = Field(..., description="Contexto seleccionado")
    explanation: Optional[str] = None
    processing_time: float = Field(..., description="Tiempo de procesamiento en segundos")
    status: str = Field(default="completed")
    metadata: Dict[str, Any] = Field(default_factory=dict)