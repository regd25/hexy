# Concepto de Artefactos

Un artefacto en Hexy Framework es una unidad semántica que representa intenciones, condiciones, actores, flujos de trabajo o cualquier elemento relevante para la organización y su contexto. Los artefactos son siempre descriptivos y narrativos, nunca estructurados en campos, y su propósito es capturar el significado y la lógica de la organización de manera auditable y referenciable.

## Características clave
- **Semánticos**: Su contenido es puramente narrativo y significativo.
- **Referenciables**: Se pueden vincular entre sí usando la sintaxis `@nombre-del-artefacto`.
- **Contextuales**: Cada artefacto existe dentro de un contexto organizacional definido.
- **Auditables**: Permiten rastrear la evolución y el uso de cada elemento en la organización.

## Ejemplo
```markdown
Transformar la cultura organizacional hacia la transparencia radical
```

## Tipos de artefactos
- Fundacionales: propósito, contexto, autoridad, evaluación
- Estratégicos y narrativos: visión, política, principio, guía, concepto, indicador
- Operativos: proceso, procedimiento, evento, resultado, observación
- Organizacionales: actor, área

Cada artefacto debe existir como un archivo o entrada semántica única, sin campos adicionales, y puede referenciar a otros artefactos mediante `@`. 