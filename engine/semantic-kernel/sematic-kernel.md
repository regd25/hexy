# SemanticKernel

Narrative:
El SemanticKernel es el núcleo que valida la estructura semántica del lenguaje SCL. Asegura que todos los artefactos definidos cumplan con las convenciones del lenguaje: narrativa explícita, alineación gramatical, consistencia con los axiomas y trazabilidad. Permite escalar la representación del conocimiento organizacional.

## Rule

- Id: SemanticValidationRequired  
  Narrative: Todo documento `.scl.yaml` debe pasar por una validación estructural y semántica antes de ser aceptado dentro del sistema.

- Id: NarrativeMandatoryInAllArtifacts  
  Narrative: Cada artefacto definido en SCL debe incluir una narrativa clara que exponga su propósito dentro del sistema.

## Protocol

- Id: ValidateSemanticCompliance  
  Narrative: Revisa que todos los campos de un artefacto respeten la semántica del lenguaje SCL: convenciones, narrativa, estructuras y relaciones.

- Id: UpdateSemanticRuleset  
  Narrative: Gestiona los cambios al conjunto de reglas semánticas, asegurando que las nuevas versiones no rompan compatibilidad con artefactos existentes.

- Id: EvaluateNarrativeCoherence  
  Narrative: Evalúa si la narrativa de un artefacto mantiene coherencia lógica y contextual con el resto del documento.

- Id: ValidateContextExtension  
  Narrative: Valida que cualquier nuevo contexto agregado respete las convenciones del lenguaje y no contradiga la narrativa del núcleo semántico.

## Flow

- Id: DefinirContextoSemanticKernel  
  Narrative: Crea el contexto base del SemanticKernel incluyendo reglas, protocolos y flujos semánticos básicos.

- Id: EjecutarValidacionSemantica  
  Narrative: Lanza el proceso de revisión semántica sobre un documento o conjunto de artefactos definidos en SCL.

- Id: ProponerActualizacionDeReglas  
  Narrative: Ejecuta el flujo de sugerencia, revisión, votación y publicación de nuevas reglas semánticas para el sistema.

- Id: ValidarExtensionDeContexto  
  Narrative: Verifica que la incorporación de un nuevo contexto no contradiga las definiciones semánticas ya aprobadas.

## Kpi

- Id: ValidationTimeMs  
  Narrative: Tiempo promedio (en milisegundos) que tarda el SemanticKernel en validar un documento `.scl.yaml` completo.  
  Unit: Milliseconds

- Id: SemanticAlignmentScore  
  Narrative: Porcentaje de artefactos que cumplen correctamente con las convenciones semánticas del lenguaje.  
  Unit: Percentage

- Id: ConflictRatePerDoc  
  Narrative: Promedio de conflictos detectados por documento durante la validación semántica.  
  Unit: Decimal

- Id: EscalationRatio  
  Narrative: Porcentaje de casos que requieren intervención humana tras la evaluación del kernel.  
  Unit: Percentage

- Id: ContextRejectionRate  
  Narrative: Tasa de contextos que son rechazados por no alinearse correctamente a la semántica establecida.  
  Unit: Percentage

- Id: CoverageScore  
  Narrative: Porcentaje del grafo total de artefactos que ha sido validado formalmente.  
  Unit: Percentage

- Id: NarrativeInferenceAccuracy  
  Narrative: Precisión del modelo de lenguaje al generar o inferir la narrativa de artefactos sin narrativa explícita.  
  Unit: Percentage

## Outcome

- Id: SemanticValidationApproved  
  Narrative: El documento fue validado exitosamente y puede ser integrado al grafo organizacional.

- Id: SemanticValidationEscalated  
  Narrative: El documento fue enviado a revisión humana por inconsistencias no resolubles automáticamente.

- Id: RulesetUpdated  
  Narrative: La propuesta de actualización de reglas fue aprobada y publicada como versión estable.

- Id: RulesetRejected  
  Narrative: La propuesta de actualización fue rechazada por romper convenciones o no incluir narrativa adecuada.

- Id: ContextExtensionValidated  
  Narrative: El nuevo contexto fue evaluado y se integró sin romper la semántica preexistente.

- Id: ContextExtensionRejected  
  Narrative: El contexto fue rechazado por conflicto semántico o narrativa incompleta.