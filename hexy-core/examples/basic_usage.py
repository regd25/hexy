"""
Basic usage example for Hexy Core
"""
from src.engine.semantic_engine import SemanticEngine
from src.events.event_bus import EventBus
from src.artifacts.foundational import Purpose, Context, Authority, Evaluation
from src.artifacts.strategic import Vision, Policy, Principle, Guideline, Concept, Indicator
from src.artifacts.operational import Process, Procedure, Event, Result, Observation
from src.artifacts.organizational import Actor, Area


def main():
    """Main example function"""
    print("🚀 Hexy Core - Basic Usage Example")
    print("=" * 50)
    
    event_bus = EventBus()
    engine = SemanticEngine(event_bus)
    
    print("\n📝 Creating Foundational Artifacts...")
    
    purpose = Purpose(
        id="transparency-purpose",
        name="Transparencia Radical",
        description="Transformar la cultura organizacional hacia la transparencia radical",
        relationships=["latam-context", "consejo-directivo"],
        metadata={"domain": "culture", "priority": "high"}
    )
    
    context = Context(
        id="latam-context",
        name="Contexto Latinoamérica",
        description="Aplica a operaciones en Latinoamérica entre 2024–2028",
        relationships=["transparency-purpose"],
        metadata={"region": "latam", "period": "2024-2028"}
    )
    
    authority = Authority(
        id="consejo-directivo",
        name="Consejo Directivo",
        description="Máxima autoridad para aprobar políticas de transparencia",
        relationships=["transparency-purpose"],
        metadata={"hierarchy_level": 1, "mandate_type": "executive"}
    )
    
    evaluation = Evaluation(
        id="transparency-evaluation",
        name="Evaluación de Transparencia",
        description="Criterios para medir el éxito de la iniciativa de transparencia",
        relationships=["transparency-purpose"],
        metadata={"metrics": ["participation_rate", "conflict_count", "satisfaction"]}
    )
    
    print("\n📝 Creating Strategic Artifacts...")
    
    vision = Vision(
        id="transparency-vision",
        name="Visión de Transparencia",
        description="Una organización donde la transparencia sea el pilar fundamental",
        relationships=["transparency-purpose"],
        metadata={"timeframe": "long_term", "scope": "organization_wide"}
    )
    
    policy = Policy(
        id="transparency-policy",
        name="Política de Transparencia",
        description="Compromisos colectivos que rigen el comportamiento transparente",
        relationships=["transparency-purpose", "transparency-vision"],
        metadata={"enforcement_level": "mandatory", "review_period": "annual"}
    )
    
    principle = Principle(
        id="trust-principle",
        name="Principio de Confianza",
        description="Verdad operativa fundamental para decisiones",
        relationships=["transparency-policy"],
        metadata={"category": "operational", "priority": "core"}
    )
    
    print("\n📝 Creating Operational Artifacts...")
    
    process = Process(
        id="onboarding-process",
        name="Proceso de Onboarding",
        description="Secuencia viva de transformaciones para nuevos empleados",
        relationships=["transparency-policy"],
        metadata={"duration": "30_days", "stakeholders": ["hr", "manager", "new_employee"]}
    )
    
    procedure = Procedure(
        id="transparency-procedure",
        name="Procedimiento de Transparencia",
        description="Coreografía detallada de acciones específicas para transparencia",
        relationships=["onboarding-process"],
        metadata={"steps": 5, "approval_required": True}
    )
    
    event = Event(
        id="policy-approved",
        name="Política Aprobada",
        description="Cambio de estado relevante cuando se aprueba una política",
        relationships=["transparency-policy"],
        metadata={"trigger": "approval", "notification_required": True}
    )
    
    print("\n✅ Registering Artifacts...")
    
    artifacts = [
        purpose, context, authority, evaluation,
        vision, policy, principle,
        process, procedure, event
    ]
    
    for artifact in artifacts:
        success = engine.register_artifact(artifact)
        if success:
            print(f"  ✅ {artifact.get_type().value}: {artifact.name}")
        else:
            print(f"  ❌ Failed to register {artifact.name}")
    
    print("\n🔍 Validating Coherence...")
    coherence_report = engine.validate_coherence()
    
    print(f"  Overall Valid: {coherence_report['valid']}")
    print(f"  Total Artifacts: {coherence_report['statistics']['total_artifacts']}")
    print(f"  Issues Found: {len(coherence_report['issues'])}")
    
    if coherence_report['issues']:
        print("\n  Issues:")
        for issue in coherence_report['issues']:
            print(f"    - {issue['message']}")
    
    print("\n📊 Statistics by Type:")
    for artifact_type, count in coherence_report['statistics']['by_type'].items():
        print(f"  {artifact_type}: {count}")
    
    print("\n📡 Event Bus Statistics:")
    event_stats = event_bus.get_statistics()
    print(f"  Total Events: {event_stats['total_events']}")
    print(f"  Event Types: {event_stats['event_types']}")
    
    print("\n🔗 Testing Relationships...")
    engine.add_relationship("transparency-purpose", "latam-context", "contextualizes")
    engine.add_relationship("transparency-purpose", "consejo-directivo", "authorized_by")
    engine.add_relationship("transparency-policy", "transparency-purpose", "implements")
    
    print(f"  Total Relationships: {len(engine.relationships)}")
    
    print("\n🎉 Example completed successfully!")


if __name__ == "__main__":
    main()
