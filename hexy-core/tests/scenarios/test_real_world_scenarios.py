"""
Real-world scenario tests
"""

import pytest
from src.engine.semantic_engine import SemanticEngine
from src.events.event_bus import EventBus
from src.artifacts.foundational import Purpose, Context, Authority, Evaluation
from src.artifacts.strategic import Vision, Policy, Principle, Guideline
from src.artifacts.operational import Process, Procedure, Event, Result
from src.artifacts.organizational import Actor, Area


class TestRealWorldScenarios:
    """Test real-world organizational scenarios"""

    def setup_method(self):
        """Setup for each test"""
        self.event_bus = EventBus()
        self.engine = SemanticEngine(self.event_bus)

    def test_transparency_initiative_scenario(self):
        """Test complete transparency initiative scenario"""
        # Create foundational artifacts
        purpose = Purpose(
            id="transparency-purpose",
            name="Transparencia Radical",
            description="Transformar la cultura organizacional hacia la transparencia radical",
            relationships=[],
            metadata={"domain": "culture", "priority": "high"},
        )

        context = Context(
            id="latam-context",
            name="Contexto Latinoamérica",
            description="Aplica a operaciones en Latinoamérica entre 2024–2028",
            relationships=["transparency-purpose"],
            metadata={"region": "latam", "period": "2024-2028"},
        )

        authority = Authority(
            id="consejo-directivo",
            name="Consejo Directivo",
            description="Máxima autoridad para aprobar políticas de transparencia",
            relationships=["transparency-purpose"],
            metadata={"hierarchy_level": 1, "mandate_type": "executive"},
        )

        evaluation = Evaluation(
            id="transparency-evaluation",
            name="Evaluación de Transparencia",
            description="Criterios para medir el éxito de la iniciativa",
            relationships=["transparency-purpose"],
            metadata={
                "metrics": ["participation_rate", "conflict_count", "satisfaction"]
            },
        )

        # Create strategic artifacts
        vision = Vision(
            id="transparency-vision",
            name="Visión de Transparencia",
            description="Una organización donde la transparencia sea el pilar fundamental",
            relationships=["transparency-purpose"],
            metadata={"timeframe": "long_term", "scope": "organization_wide"},
        )

        policy = Policy(
            id="transparency-policy",
            name="Política de Transparencia",
            description="Compromisos colectivos que rigen el comportamiento transparente",
            relationships=["transparency-purpose", "transparency-vision"],
            metadata={"enforcement_level": "mandatory", "review_period": "annual"},
        )

        principle = Principle(
            id="trust-principle",
            name="Principio de Confianza",
            description="Verdad operativa fundamental para decisiones",
            relationships=["transparency-policy"],
            metadata={"category": "operational", "priority": "core"},
        )

        guideline = Guideline(
            id="communication-guideline",
            name="Guía de Comunicación Transparente",
            description="Recomendaciones basadas en experiencia para comunicación transparente",
            relationships=["transparency-policy"],
            metadata={"category": "communication", "audience": "all_employees"},
        )

        # Create operational artifacts
        process = Process(
            id="transparency-process",
            name="Proceso de Implementación de Transparencia",
            description="Secuencia viva de transformaciones para implementar transparencia",
            relationships=["transparency-policy"],
            metadata={
                "duration": "ongoing",
                "stakeholders": ["management", "employees"],
            },
        )

        procedure = Procedure(
            id="decision-procedure",
            name="Procedimiento de Decisiones Transparentes",
            description="Coreografía detallada de acciones para decisiones transparentes",
            relationships=["transparency-process"],
            metadata={"steps": 5, "approval_required": True},
        )

        event = Event(
            id="policy-approved",
            name="Política de Transparencia Aprobada",
            description="Cambio de estado cuando se aprueba la política de transparencia",
            relationships=["transparency-policy"],
            metadata={"trigger": "approval", "notification_required": True},
        )

        result = Result(
            id="transparency-result",
            name="Cultura de Transparencia Establecida",
            description="Efecto deseado de la implementación de transparencia",
            relationships=["transparency-process"],
            metadata={
                "success_criteria": ["80% participation", "5 conflicts per month"]
            },
        )

        # Create organizational artifacts
        actor = Actor(
            id="transparency-committee",
            name="Comité de Transparencia",
            description="Entidad responsable de implementar la transparencia",
            relationships=["transparency-process"],
            metadata={"type": "committee", "members": 5},
        )

        area = Area(
            id="culture-area",
            name="Área de Cultura Organizacional",
            description="Dominio operativo para la cultura organizacional",
            relationships=["transparency-process"],
            metadata={"scope": "organization_wide", "priority": "high"},
        )

        # Register all artifacts
        artifacts = [
            purpose,
            context,
            authority,
            evaluation,
            vision,
            policy,
            principle,
            guideline,
            process,
            procedure,
            event,
            result,
            actor,
            area,
        ]

        for artifact in artifacts:
            assert self.engine.register_artifact(artifact)

        # Add relationships
        self.engine.add_relationship(
            "transparency-purpose", "latam-context", "contextualizes"
        )
        self.engine.add_relationship(
            "transparency-purpose", "consejo-directivo", "authorized_by"
        )
        self.engine.add_relationship(
            "transparency-policy", "transparency-purpose", "implements"
        )
        self.engine.add_relationship(
            "transparency-process", "transparency-policy", "executes"
        )
        self.engine.add_relationship(
            "transparency-committee", "transparency-process", "executes"
        )

        # Validate coherence
        report = self.engine.validate_coherence()
        assert report["valid"] is True
        assert report["statistics"]["total_artifacts"] == 14
        assert len(report["issues"]) == 0

        # Test semantic search
        results = self.engine.find_semantic_matches("transparencia", limit=5)
        assert len(results) > 0

        # Verify all artifact types are represented
        type_counts = report["statistics"]["by_type"]
        assert type_counts["purpose"] == 1
        assert type_counts["context"] == 1
        assert type_counts["authority"] == 1
        assert type_counts["evaluation"] == 1
        assert type_counts["vision"] == 1
        assert type_counts["policy"] == 1
        assert type_counts["principle"] == 1
        assert type_counts["guideline"] == 1
        assert type_counts["process"] == 1
        assert type_counts["procedure"] == 1
        assert type_counts["event"] == 1
        assert type_counts["result"] == 1
        assert type_counts["actor"] == 1
        assert type_counts["area"] == 1

    def test_digital_transformation_scenario(self):
        """Test digital transformation scenario"""
        # Create artifacts for digital transformation
        purpose = Purpose(
            id="digital-purpose",
            name="Transformación Digital",
            description="Transformar la organización hacia la era digital",
            relationships=[],
            metadata={"domain": "technology", "priority": "critical"},
        )

        context = Context(
            id="global-context",
            name="Contexto Global",
            description="Aplica a todas las operaciones globales",
            relationships=["digital-purpose"],
            metadata={"scope": "global", "period": "2024-2030"},
        )

        # Create strategic artifacts
        vision = Vision(
            id="digital-vision",
            name="Visión Digital",
            description="Organización completamente digitalizada",
            relationships=["digital-purpose"],
            metadata={"timeframe": "2030", "scope": "global"},
        )

        policy = Policy(
            id="digital-policy",
            name="Política de Transformación Digital",
            description="Compromisos para la transformación digital",
            relationships=["digital-vision"],
            metadata={"enforcement_level": "mandatory"},
        )

        # Create operational artifacts
        process = Process(
            id="digital-process",
            name="Proceso de Digitalización",
            description="Proceso de transformación digital",
            relationships=["digital-policy"],
            metadata={"duration": "6_years", "stakeholders": ["IT", "business"]},
        )

        # Register artifacts
        artifacts = [purpose, context, vision, policy, process]
        for artifact in artifacts:
            assert self.engine.register_artifact(artifact)

        # Add relationships
        self.engine.add_relationship(
            "digital-purpose", "global-context", "contextualizes"
        )
        self.engine.add_relationship("digital-vision", "digital-purpose", "implements")
        self.engine.add_relationship("digital-process", "digital-policy", "executes")

        # Validate
        report = self.engine.validate_coherence()
        assert report["valid"] is True
        assert report["statistics"]["total_artifacts"] == 5

    def test_agile_transformation_scenario(self):
        """Test agile transformation scenario"""
        # Create artifacts for agile transformation
        purpose = Purpose(
            id="agile-purpose",
            name="Transformación Ágil",
            description="Implementar metodologías ágiles en toda la organización",
            relationships=[],
            metadata={"domain": "methodology", "priority": "high"},
        )

        # Create strategic artifacts
        vision = Vision(
            id="agile-vision",
            name="Visión Ágil",
            description="Organización completamente ágil",
            relationships=["agile-purpose"],
            metadata={"timeframe": "2025", "scope": "organization_wide"},
        )

        principle = Principle(
            id="agile-principle",
            name="Principio de Agilidad",
            description="Responder al cambio sobre seguir un plan",
            relationships=["agile-vision"],
            metadata={"category": "methodology", "priority": "core"},
        )

        # Create operational artifacts
        process = Process(
            id="agile-process",
            name="Proceso de Implementación Ágil",
            description="Proceso para implementar metodologías ágiles",
            relationships=["agile-principle"],
            metadata={"duration": "ongoing", "methodology": "scrum"},
        )

        procedure = Procedure(
            id="sprint-procedure",
            name="Procedimiento de Sprint",
            description="Procedimiento para ejecutar sprints",
            relationships=["agile-process"],
            metadata={
                "duration": "2_weeks",
                "ceremonies": ["planning", "review", "retrospective"],
            },
        )

        # Register artifacts
        artifacts = [purpose, vision, principle, process, procedure]
        for artifact in artifacts:
            assert self.engine.register_artifact(artifact)

        # Add relationships
        self.engine.add_relationship("agile-vision", "agile-purpose", "implements")
        self.engine.add_relationship("agile-process", "agile-principle", "executes")
        self.engine.add_relationship("sprint-procedure", "agile-process", "implements")

        # Validate
        report = self.engine.validate_coherence()
        assert report["valid"] is True
        assert report["statistics"]["total_artifacts"] == 5

    def test_compliance_scenario(self):
        """Test compliance and governance scenario"""
        # Create artifacts for compliance
        purpose = Purpose(
            id="compliance-purpose",
            name="Cumplimiento Regulatorio",
            description="Asegurar el cumplimiento de todas las regulaciones aplicables",
            relationships=[],
            metadata={"domain": "governance", "priority": "critical"},
        )

        # Create strategic artifacts
        policy = Policy(
            id="compliance-policy",
            name="Política de Cumplimiento",
            description="Política para asegurar el cumplimiento regulatorio",
            relationships=["compliance-purpose"],
            metadata={"enforcement_level": "mandatory", "review_period": "quarterly"},
        )

        guideline = Guideline(
            id="compliance-guideline",
            name="Guía de Cumplimiento",
            description="Guía para implementar el cumplimiento",
            relationships=["compliance-policy"],
            metadata={"category": "governance", "audience": "all_employees"},
        )

        # Create operational artifacts
        process = Process(
            id="compliance-process",
            name="Proceso de Cumplimiento",
            description="Proceso para monitorear y asegurar el cumplimiento",
            relationships=["compliance-policy"],
            metadata={
                "frequency": "continuous",
                "stakeholders": ["legal", "compliance"],
            },
        )

        # Create organizational artifacts
        actor = Actor(
            id="compliance-officer",
            name="Oficial de Cumplimiento",
            description="Responsable de asegurar el cumplimiento",
            relationships=["compliance-process"],
            metadata={"type": "role", "level": "senior"},
        )

        area = Area(
            id="governance-area",
            name="Área de Gobernanza",
            description="Área responsable de la gobernanza",
            relationships=["compliance-process"],
            metadata={"scope": "organization_wide", "priority": "critical"},
        )

        # Register artifacts
        artifacts = [purpose, policy, guideline, process, actor, area]
        for artifact in artifacts:
            assert self.engine.register_artifact(artifact)

        # Add relationships
        self.engine.add_relationship(
            "compliance-policy", "compliance-purpose", "implements"
        )
        self.engine.add_relationship(
            "compliance-process", "compliance-policy", "executes"
        )
        self.engine.add_relationship(
            "compliance-officer", "compliance-process", "executes"
        )
        self.engine.add_relationship("governance-area", "compliance-process", "owns")

        # Validate
        report = self.engine.validate_coherence()
        assert report["valid"] is True
        assert report["statistics"]["total_artifacts"] == 6
