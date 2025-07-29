"""
Unit tests for artifacts
"""
import pytest
from datetime import datetime

from src.artifacts.base import BaseArtifact, ArtifactType
from src.artifacts.foundational import Purpose, Context, Authority, Evaluation
from src.artifacts.strategic import Vision, Policy, Principle, Guideline, Concept, Indicator
from src.artifacts.operational import Process, Procedure, Event, Result, Observation
from src.artifacts.organizational import Actor, Area


class TestBaseArtifact:
    """Test BaseArtifact class"""
    
    def test_artifact_creation(self):
        """Test creating a basic artifact"""
        artifact = Purpose(
            id="test-purpose",
            name="Test Purpose",
            description="A test purpose description",
            relationships=["context-1", "authority-1"],
            metadata={"domain": "test", "priority": "high"}
        )
        
        assert artifact.id == "test-purpose"
        assert artifact.name == "Test Purpose"
        assert artifact.description == "A test purpose description"
        assert artifact.relationships == ["context-1", "authority-1"]
        assert artifact.metadata == {"domain": "test", "priority": "high"}
        assert artifact.get_type() == ArtifactType.PURPOSE
    
    def test_artifact_serialization(self):
        """Test artifact serialization to dict"""
        artifact = Purpose(
            id="test-purpose",
            name="Test Purpose",
            description="A test purpose description"
        )
        
        artifact_dict = artifact.to_dict()
        
        assert artifact_dict["id"] == "test-purpose"
        assert artifact_dict["name"] == "Test Purpose"
        assert artifact_dict["type"] == "purpose"
        assert artifact_dict["description"] == "A test purpose description"
        assert "created_at" in artifact_dict
        assert "updated_at" in artifact_dict
    
    def test_artifact_relationships(self):
        """Test artifact relationship management"""
        artifact = Purpose(
            id="test-purpose",
            name="Test Purpose"
        )
        
        artifact.add_relationship("context-1")
        assert "context-1" in artifact.relationships
        
        artifact.add_relationship("authority-1")
        assert len(artifact.relationships) == 2
        
        artifact.remove_relationship("context-1")
        assert "context-1" not in artifact.relationships
        assert "authority-1" in artifact.relationships
    
    def test_artifact_update(self):
        """Test artifact property updates"""
        artifact = Purpose(
            id="test-purpose",
            name="Test Purpose"
        )
        
        original_updated_at = artifact.updated_at
        
        artifact.update(name="Updated Purpose", description="Updated description")
        
        assert artifact.name == "Updated Purpose"
        assert artifact.description == "Updated description"
        assert artifact.updated_at > original_updated_at


class TestFoundationalArtifacts:
    """Test foundational artifacts"""
    
    def test_purpose_artifact(self):
        """Test Purpose artifact"""
        purpose = Purpose(
            id="transparency-purpose",
            name="Transparencia Radical",
            description="Transformar la cultura organizacional hacia la transparencia radical"
        )
        
        assert purpose.get_type() == ArtifactType.PURPOSE
        assert purpose.name == "Transparencia Radical"
    
    def test_context_artifact(self):
        """Test Context artifact"""
        context = Context(
            id="latam-context",
            name="Contexto Latinoamérica",
            description="Aplica a operaciones en Latinoamérica entre 2024–2028"
        )
        
        assert context.get_type() == ArtifactType.CONTEXT
        assert context.name == "Contexto Latinoamérica"
    
    def test_authority_artifact(self):
        """Test Authority artifact"""
        authority = Authority(
            id="consejo-directivo",
            name="Consejo Directivo",
            description="Máxima autoridad para aprobar políticas"
        )
        
        assert authority.get_type() == ArtifactType.AUTHORITY
        assert authority.name == "Consejo Directivo"
    
    def test_evaluation_artifact(self):
        """Test Evaluation artifact"""
        evaluation = Evaluation(
            id="transparency-evaluation",
            name="Evaluación de Transparencia",
            description="Criterios para medir el éxito de la iniciativa"
        )
        
        assert evaluation.get_type() == ArtifactType.EVALUATION
        assert evaluation.name == "Evaluación de Transparencia"


class TestStrategicArtifacts:
    """Test strategic artifacts"""
    
    def test_vision_artifact(self):
        """Test Vision artifact"""
        vision = Vision(
            id="future-vision",
            name="Visión de Futuro",
            description="Futuro deseado de la organización"
        )
        
        assert vision.get_type() == ArtifactType.VISION
    
    def test_policy_artifact(self):
        """Test Policy artifact"""
        policy = Policy(
            id="transparency-policy",
            name="Política de Transparencia",
            description="Compromisos colectivos que rigen el comportamiento"
        )
        
        assert policy.get_type() == ArtifactType.POLICY
    
    def test_principle_artifact(self):
        """Test Principle artifact"""
        principle = Principle(
            id="trust-principle",
            name="Principio de Confianza",
            description="Verdad operativa fundamental"
        )
        
        assert principle.get_type() == ArtifactType.PRINCIPLE
    
    def test_guideline_artifact(self):
        """Test Guideline artifact"""
        guideline = Guideline(
            id="communication-guideline",
            name="Guía de Comunicación",
            description="Recomendación basada en experiencia"
        )
        
        assert guideline.get_type() == ArtifactType.GUIDELINE
    
    def test_concept_artifact(self):
        """Test Concept artifact"""
        concept = Concept(
            id="transparency-concept",
            name="Concepto de Transparencia",
            description="Significado compartido de términos clave"
        )
        
        assert concept.get_type() == ArtifactType.CONCEPT
    
    def test_indicator_artifact(self):
        """Test Indicator artifact"""
        indicator = Indicator(
            id="participation-indicator",
            name="Indicador de Participación",
            description="Historia contada con datos para inferir avance"
        )
        
        assert indicator.get_type() == ArtifactType.INDICATOR


class TestOperationalArtifacts:
    """Test operational artifacts"""
    
    def test_process_artifact(self):
        """Test Process artifact"""
        process = Process(
            id="onboarding-process",
            name="Proceso de Onboarding",
            description="Secuencia viva de transformaciones"
        )
        
        assert process.get_type() == ArtifactType.PROCESS
    
    def test_procedure_artifact(self):
        """Test Procedure artifact"""
        procedure = Procedure(
            id="ticket-procedure",
            name="Procedimiento de Tickets",
            description="Coreografía detallada de acciones específicas"
        )
        
        assert procedure.get_type() == ArtifactType.PROCEDURE
    
    def test_event_artifact(self):
        """Test Event artifact"""
        event = Event(
            id="contract-signed",
            name="Contrato Firmado",
            description="Cambio de estado relevante"
        )
        
        assert event.get_type() == ArtifactType.EVENT
    
    def test_result_artifact(self):
        """Test Result artifact"""
        result = Result(
            id="team-autonomy",
            name="Autonomía del Equipo",
            description="Efecto deseado de un flujo o proceso"
        )
        
        assert result.get_type() == ArtifactType.RESULT
    
    def test_observation_artifact(self):
        """Test Observation artifact"""
        observation = Observation(
            id="response-observation",
            name="Observación de Respuestas",
            description="Registro de hecho perceptual o narrativo"
        )
        
        assert observation.get_type() == ArtifactType.OBSERVATION


class TestOrganizationalArtifacts:
    """Test organizational artifacts"""
    
    def test_actor_artifact(self):
        """Test Actor artifact"""
        actor = Actor(
            id="culture-committee",
            name="Comité de Cultura",
            description="Entidad capaz de tomar acción con sentido"
        )
        
        assert actor.get_type() == ArtifactType.ACTOR
    
    def test_area_artifact(self):
        """Test Area artifact"""
        area = Area(
            id="product-area",
            name="Área de Producto",
            description="Dominio operativo con identidad y propósito propios"
        )
        
        assert area.get_type() == ArtifactType.AREA


class TestArtifactTypes:
    """Test artifact type enumeration"""
    
    def test_artifact_type_values(self):
        """Test that all artifact types have correct values"""
        assert ArtifactType.PURPOSE.value == "purpose"
        assert ArtifactType.CONTEXT.value == "context"
        assert ArtifactType.AUTHORITY.value == "authority"
        assert ArtifactType.EVALUATION.value == "evaluation"
        assert ArtifactType.VISION.value == "vision"
        assert ArtifactType.POLICY.value == "policy"
        assert ArtifactType.PRINCIPLE.value == "principle"
        assert ArtifactType.GUIDELINE.value == "guideline"
        assert ArtifactType.CONCEPT.value == "concept"
        assert ArtifactType.INDICATOR.value == "indicator"
        assert ArtifactType.PROCESS.value == "process"
        assert ArtifactType.PROCEDURE.value == "procedure"
        assert ArtifactType.EVENT.value == "event"
        assert ArtifactType.RESULT.value == "result"
        assert ArtifactType.OBSERVATION.value == "observation"
        assert ArtifactType.ACTOR.value == "actor"
        assert ArtifactType.AREA.value == "area"
