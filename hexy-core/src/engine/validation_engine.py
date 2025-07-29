"""
Validation Engine - Semantic coherence validation
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

from ..artifacts.base import BaseArtifact, ArtifactType
from ..events.event_bus import EventBus

logger = logging.getLogger(__name__)


class ValidationRule:
    """Base class for validation rules"""

    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    def validate(self, artifacts: Dict[str, BaseArtifact]) -> Dict[str, Any]:
        """Validate artifacts according to this rule"""
        raise NotImplementedError("Subclasses must implement validate method")


class CoherenceRule(ValidationRule):
    """Rule for checking semantic coherence between artifacts"""

    def __init__(self):
        super().__init__("coherence", "Check semantic coherence between artifacts")

    def validate(self, artifacts: Dict[str, BaseArtifact]) -> Dict[str, Any]:
        """Validate coherence between artifacts"""
        issues = []

        # Check for circular references
        circular_refs = self._check_circular_references(artifacts)
        if circular_refs:
            issues.append(
                {
                    "type": "circular_reference",
                    "message": f"Circular references detected: {circular_refs}",
                    "severity": "error",
                }
            )

        # Check for orphaned references
        orphaned_refs = self._check_orphaned_references(artifacts)
        if orphaned_refs:
            issues.append(
                {
                    "type": "orphaned_reference",
                    "message": f"Orphaned references detected: {orphaned_refs}",
                    "severity": "warning",
                }
            )

        # Check for conflicting contexts
        context_conflicts = self._check_context_conflicts(artifacts)
        if context_conflicts:
            issues.append(
                {
                    "type": "context_conflict",
                    "message": f"Context conflicts detected: {context_conflicts}",
                    "severity": "error",
                }
            )

        return {"valid": len(issues) == 0, "issues": issues, "rule": self.name}

    def _check_circular_references(
        self, artifacts: Dict[str, BaseArtifact]
    ) -> List[str]:
        """Check for circular references between artifacts"""
        circular_refs = []

        for artifact_id, artifact in artifacts.items():
            for ref_id in artifact.references:
                if ref_id in artifacts:
                    ref_artifact = artifacts[ref_id]
                    if artifact_id in ref_artifact.references:
                        circular_refs.append(f"{artifact_id} <-> {ref_id}")

        return circular_refs

    def _check_orphaned_references(
        self, artifacts: Dict[str, BaseArtifact]
    ) -> List[str]:
        """Check for references to non-existent artifacts"""
        orphaned_refs = []

        for artifact_id, artifact in artifacts.items():
            for ref_id in artifact.references:
                if ref_id not in artifacts:
                    orphaned_refs.append(f"{artifact_id} -> {ref_id}")

        return orphaned_refs

    def _check_context_conflicts(self, artifacts: Dict[str, BaseArtifact]) -> List[str]:
        """Check for conflicts in semantic contexts"""
        context_conflicts = []

        # Group artifacts by domain
        domains = {}
        for artifact_id, artifact in artifacts.items():
            domain = artifact.context.domain
            if domain not in domains:
                domains[domain] = []
            domains[domain].append(artifact)

        # Check for overlapping validity periods within domains
        for domain, domain_artifacts in domains.items():
            for i, artifact1 in enumerate(domain_artifacts):
                for artifact2 in domain_artifacts[i + 1 :]:
                    if self._contexts_overlap(artifact1.context, artifact2.context):
                        context_conflicts.append(
                            f"{artifact1.id} overlaps with {artifact2.id}"
                        )

        return context_conflicts

    def _contexts_overlap(self, context1, context2) -> bool:
        """Check if two contexts overlap in time"""
        start1, end1 = context1.validity_period
        start2, end2 = context2.validity_period

        return start1 < end2 and start2 < end1


class CompletenessRule(ValidationRule):
    """Rule for checking completeness of artifact sets"""

    def __init__(self):
        super().__init__("completeness", "Check completeness of artifact sets")

    def validate(self, artifacts: Dict[str, BaseArtifact]) -> Dict[str, Any]:
        """Validate completeness of artifact sets"""
        issues = []

        # Check for required foundational artifacts
        foundational_artifacts = [
            a
            for a in artifacts.values()
            if a.get_type() in [ArtifactType.PURPOSE, ArtifactType.CONTEXT]
        ]

        if not foundational_artifacts:
            issues.append(
                {
                    "type": "missing_foundational",
                    "message": "No foundational artifacts (Purpose, Context) found",
                    "severity": "error",
                }
            )

        # Check for required strategic artifacts
        strategic_artifacts = [
            a
            for a in artifacts.values()
            if a.get_type() in [ArtifactType.VISION, ArtifactType.POLICY]
        ]

        if not strategic_artifacts:
            issues.append(
                {
                    "type": "missing_strategic",
                    "message": "No strategic artifacts (Vision, Policy) found",
                    "severity": "warning",
                }
            )

        # Check for required organizational artifacts
        organizational_artifacts = [
            a
            for a in artifacts.values()
            if a.get_type() in [ArtifactType.ACTOR, ArtifactType.AREA]
        ]

        if not organizational_artifacts:
            issues.append(
                {
                    "type": "missing_organizational",
                    "message": "No organizational artifacts (Actor, Area) found",
                    "severity": "warning",
                }
            )

        return {"valid": len(issues) == 0, "issues": issues, "rule": self.name}


class ValidationEngine:
    """Engine for validating semantic coherence"""

    def __init__(self, event_bus: EventBus = None):
        self.event_bus = event_bus or EventBus()
        self.rules: List[ValidationRule] = [CoherenceRule(), CompletenessRule()]

        # Register event handlers
        self._setup_event_handlers()

    def _setup_event_handlers(self):
        """Setup event handlers for validation engine"""
        self.event_bus.subscribe("artifact.registered", self._on_artifact_registered)
        self.event_bus.subscribe("artifact.updated", self._on_artifact_updated)
        self.event_bus.subscribe("artifact.deleted", self._on_artifact_deleted)

    def validate_artifact(
        self, artifact: BaseArtifact, all_artifacts: Dict[str, BaseArtifact]
    ) -> Dict[str, Any]:
        """Validate a single artifact against all artifacts"""
        validation_results = []

        for rule in self.rules:
            result = rule.validate(all_artifacts)
            validation_results.append(result)

        # Aggregate results
        all_valid = all(result["valid"] for result in validation_results)
        all_issues = []
        for result in validation_results:
            all_issues.extend(result.get("issues", []))

        validation_report = {
            "valid": all_valid,
            "artifact_id": artifact.id,
            "artifact_type": artifact.get_type().value,
            "issues": all_issues,
            "rules_applied": [result["rule"] for result in validation_results],
        }

        # Publish validation event
        self.event_bus.publish(
            "validation.completed",
            {
                "artifact_id": artifact.id,
                "valid": all_valid,
                "issues_count": len(all_issues),
            },
        )

        return validation_report

    def validate_all(self, artifacts: Dict[str, BaseArtifact]) -> Dict[str, Any]:
        """Validate all artifacts for coherence"""
        validation_results = []

        for rule in self.rules:
            result = rule.validate(artifacts)
            validation_results.append(result)

        # Aggregate results
        all_valid = all(result["valid"] for result in validation_results)
        all_issues = []
        for result in validation_results:
            all_issues.extend(result.get("issues", []))

        # Generate statistics
        statistics = {
            "total_artifacts": len(artifacts),
            "by_type": {},
            "validation_rules": len(self.rules),
            "issues_by_severity": {},
        }

        for artifact in artifacts.values():
            artifact_type = artifact.get_type().value
            if artifact_type not in statistics["by_type"]:
                statistics["by_type"][artifact_type] = 0
            statistics["by_type"][artifact_type] += 1

        for issue in all_issues:
            severity = issue.get("severity", "unknown")
            if severity not in statistics["issues_by_severity"]:
                statistics["issues_by_severity"][severity] = 0
            statistics["issues_by_severity"][severity] += 1

        validation_report = {
            "valid": all_valid,
            "issues": all_issues,
            "statistics": statistics,
            "rules_applied": [result["rule"] for result in validation_results],
        }

        # Publish validation event
        self.event_bus.publish(
            "validation.all_completed",
            {
                "total_artifacts": len(artifacts),
                "valid": all_valid,
                "issues_count": len(all_issues),
            },
        )

        return validation_report

    def add_rule(self, rule: ValidationRule):
        """Add a custom validation rule"""
        self.rules.append(rule)
        logger.info(f"Validation rule added: {rule.name}")

    def remove_rule(self, rule_name: str):
        """Remove a validation rule by name"""
        self.rules = [rule for rule in self.rules if rule.name != rule_name]
        logger.info(f"Validation rule removed: {rule_name}")

    def get_rules(self) -> List[ValidationRule]:
        """Get all validation rules"""
        return self.rules

    def _on_artifact_registered(self, event: Dict[str, Any]):
        """Handle artifact registered event"""
        logger.info(f"Artifact registered event: {event}")

    def _on_artifact_updated(self, event: Dict[str, Any]):
        """Handle artifact updated event"""
        logger.info(f"Artifact updated event: {event}")

    def _on_artifact_deleted(self, event: Dict[str, Any]):
        """Handle artifact deleted event"""
        logger.info(f"Artifact deleted event: {event}")
