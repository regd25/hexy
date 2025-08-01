/**
 * Servicio para manejar las sugerencias de IA para relaciones semánticas
 */
export class SemanticService {
    constructor() {
        this.baseUrl = 'http://localhost:8000/api';
    }

    /**
     * Genera una sugerencia de IA para una relación semántica
     * @param {Object} sourceNode - Nodo de origen
     * @param {Object} targetNode - Nodo de destino
     * @param {string} relationType - Tipo de relación
     * @returns {Promise<string>} - Sugerencia generada
     */
    async generateSuggestion(sourceNode, targetNode, relationType) {
        try {
            const prompt = this.buildPrompt(sourceNode, targetNode, relationType);

            const response = await fetch(`${this.baseUrl}/generate-suggestion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    sourceNode,
                    targetNode,
                    relationType
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.suggestion;
        } catch (error) {
            console.error('Error generating AI suggestion:', error);
            return this.generateFallbackSuggestion(sourceNode, targetNode, relationType);
        }
    }

    /**
     * Construye el prompt para la IA
     * @param {Object} sourceNode - Nodo de origen
     * @param {Object} targetNode - Nodo de destino
     * @param {string} relationType - Tipo de relación
     * @returns {string} - Prompt construido
     */
    buildPrompt(sourceNode, targetNode, relationType) {
        return `
      Analiza la relación semántica entre estos dos artefactos organizacionales del framework Hexy:

      **Artefacto Origen:**
      - Nombre: ${sourceNode.name}
      - Tipo: ${sourceNode.type}
      - Descripción: ${sourceNode.info}

      **Artefacto Destino:**
      - Nombre: ${targetNode.name}
      - Tipo: ${targetNode.type}
      - Descripción: ${targetNode.info}

      **Tipo de Relación:** ${relationType}

      Genera una justificación semántica coherente que explique:

      1. **Por qué existe esta relación** - La razón lógica detrás de la conexión
      2. **Cómo contribuye al contexto organizacional** - El valor que aporta al sistema
      3. **Qué impacto tiene en la lógica de negocio** - Cómo afecta las operaciones

      La respuesta debe ser:
      - Clara y específica
      - Alineada con los principios de Hexy Framework
      - Enfocada en el contexto organizacional
      - Máximo 150 palabras

      Responde solo con la justificación, sin introducciones ni explicaciones adicionales.
    `;
    }

    /**
     * Genera una sugerencia de respaldo cuando la IA no está disponible
     * @param {Object} sourceNode - Nodo de origen
     * @param {Object} targetNode - Nodo de destino
     * @param {string} relationType - Tipo de relación
     * @returns {string} - Sugerencia de respaldo
     */
    generateFallbackSuggestion(sourceNode, targetNode, relationType) {
        const suggestions = {
            uses: `El artefacto "${sourceNode.name}" utiliza "${targetNode.name}" como componente fundamental para su funcionamiento, estableciendo una dependencia operativa que fortalece la coherencia del contexto organizacional.`,

            implements: `El artefacto "${sourceNode.name}" implementa las directrices definidas en "${targetNode.name}", asegurando que las operaciones se alineen con los principios organizacionales establecidos.`,

            supports: `El artefacto "${sourceNode.name}" proporciona soporte directo a "${targetNode.name}", facilitando su ejecución y contribuyendo al logro de los objetivos organizacionales.`,

            defines: `El artefacto "${sourceNode.name}" define los parámetros y condiciones que rigen "${targetNode.name}", estableciendo el marco de referencia para su aplicación en el contexto organizacional.`,

            triggers: `El artefacto "${sourceNode.name}" actúa como catalizador que dispara la activación de "${targetNode.name}", creando una cadena de eventos que optimiza el flujo de trabajo organizacional.`,

            validates: `El artefacto "${sourceNode.name}" valida la conformidad y calidad de "${targetNode.name}", asegurando que cumple con los estándares y expectativas del contexto organizacional.`
        };

        return suggestions[relationType] ||
            `El artefacto "${sourceNode.name}" se relaciona con "${targetNode.name}" a través de la conexión "${relationType}", estableciendo una vinculación semántica que fortalece la coherencia del contexto organizacional.`;
    }

    /**
     * Valida una relación semántica
     * @param {Object} sourceNode - Nodo de origen
     * @param {Object} targetNode - Nodo de destino
     * @param {string} relationType - Tipo de relación
     * @returns {Object} - Resultado de la validación
     */
    validateRelation(sourceNode, targetNode, relationType) {
        const validations = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (sourceNode.id === targetNode.id) {
            validations.isValid = false;
            validations.errors.push('No se puede crear una relación consigo mismo');
        }

        if (!relationType || relationType.trim() === '') {
            validations.isValid = false;
            validations.errors.push('El tipo de relación es requerido');
        }

        const hierarchicalRules = this.checkHierarchicalRules(sourceNode, targetNode, relationType);
        if (!hierarchicalRules.isValid) {
            validations.warnings.push(hierarchicalRules.message);
        }

        return validations;
    }

    /**
     * Verifica las reglas jerárquicas entre artefactos
     * @param {Object} sourceNode - Nodo de origen
     * @param {Object} targetNode - Nodo de destino
     * @param {string} relationType - Tipo de relación
     * @returns {Object} - Resultado de la validación jerárquica
     */
    checkHierarchicalRules(sourceNode, targetNode, relationType) {
        const hierarchy = {
            purpose: 1,
            vision: 2,
            policy: 3,
            principle: 4,
            guideline: 5,
            context: 6,
            actor: 7,
            concept: 8,
            process: 9,
            procedure: 10,
            event: 11,
            result: 12,
            observation: 13,
            evaluation: 14,
            indicator: 15,
            area: 16
        };

        const sourceLevel = hierarchy[sourceNode.type] || 999;
        const targetLevel = hierarchy[targetNode.type] || 999;

        if (sourceLevel > targetLevel && ['defines', 'implements'].includes(relationType)) {
            return {
                isValid: false,
                message: `Un ${sourceNode.type} no puede definir o implementar un ${targetNode.type} de nivel superior`
            };
        }

        if (sourceLevel < targetLevel && ['uses', 'depends_on'].includes(relationType)) {
            return {
                isValid: false,
                message: `Un ${sourceNode.type} de nivel superior no debería depender de un ${targetNode.type} de nivel inferior`
            };
        }

        return { isValid: true };
    }

    /**
     * Exporta las relaciones semánticas en formato SOL
     * @param {Array} semanticRelations - Lista de relaciones semánticas
     * @returns {string} - Código SOL generado
     */
    exportToSOL(semanticRelations) {
        if (!semanticRelations || semanticRelations.length === 0) {
            return '';
        }

        let solCode = '\n# Relaciones Semánticas\n';

        semanticRelations.forEach(relation => {
            solCode += `
${relation.source.name}:
  ${relation.type}: ${relation.target.name}
  justification: "${relation.justification}"
`;
        });

        return solCode;
    }
} 