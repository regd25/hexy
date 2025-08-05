# Artifact Module Template

A specialized template for creating modules that work with Hexy semantic artifacts (Purpose, Vision, Policy, etc.).

## 🎯 Purpose

This template is specifically designed for modules that:

- Manage Hexy semantic artifacts
- Follow artifact lifecycle patterns
- Integrate with the artifact validation system
- Support artifact relationships and dependencies

## 🏗️ Semantic Architecture

Built around Hexy's foundational artifacts:

### Foundational

- **Purpose**: Organizational intention
- **Context**: Validity conditions
- **Authority**: Legitimacy source
- **Evaluation**: Compliance recognition

### Strategic

- **Vision**: Desired future state
- **Policy**: Behavioral commitments
- **Principle**: Operational truths
- **Guideline**: Experience-based recommendations
- **Concept**: Shared terminology
- **Indicator**: Data-driven progress stories

### Operational

- **Process**: Transformation sequences
- **Procedure**: Detailed action choreography
- **Event**: State changes
- **Result**: Desired effects
- **Observation**: Factual records

### Organizational

- **Actor**: Action-capable entities
- **Area**: Operational domains

## 📁 Structure

```
artifact-module/
├── components/
│   ├── ArtifactContainer.tsx
│   ├── ArtifactEditor.tsx
│   ├── ArtifactViewer.tsx
│   ├── ArtifactRelations.tsx
│   └── index.tsx
├── hooks/
│   ├── useArtifact.ts
│   ├── useArtifactValidation.ts
│   ├── useArtifactRelations.ts
│   └── index.ts
├── pages/
│   └── index.tsx
├── types/
│   ├── Artifact.ts
│   └── index.ts
├── services/
│   ├── ArtifactService.ts
│   └── index.ts
└── README.md
```

## 🚀 Quick Start

1. Copy the template
2. Specify your artifact type
3. Configure validation rules
4. Implement artifact-specific logic
5. Add relationship mappings

## 🔧 Customization

See the main README for detailed customization instructions.
