# 📖 Guía de Uso - Templates SOL

## 🎯 Resumen

Se han creado **5 templates estandarizados** para los artefactos SOL más comunes, siguiendo las mejores prácticas y convenciones establecidas.

## 📁 Templates Disponibles

| Template | Tipo | Uso Principal | Ejemplo de Caso |
|----------|------|---------------|-----------------|
| `vision-template.sop` | Estratégico | Declaraciones de dirección organizacional | "Ser líder en innovación tecnológica" |
| `policy-template.sop` | Normativo | Reglas y restricciones obligatorias | "Política de seguridad de datos" |
| `concept-template.sop` | Organizacional | Definiciones fundamentales del negocio | "Cliente", "Producto", "Proyecto" |
| `process-template.sop` | Operacional | Flujos de trabajo y procedimientos | "Onboarding empleados", "Aprobación créditos" |
| `indicator-template.sop` | Medición | Métricas y KPIs de desempeño | "Satisfacción del cliente", "Tiempo de respuesta" |

## 🚀 Cómo Usar los Templates

### Paso 1: Selecciona el Template Apropiado
```bash
# Según el tipo de artefacto que necesites
cp docs/templates/vision-template.sop docs/artifacts/estrategicos/vision/mi-vision.sop
```

### Paso 2: Personaliza los Metadatos
```yaml
meta:
  id: MiVisionEspecifica              # ✅ CamelCase único
  created: "2025-01-15"               # ✅ Fecha actual
  author: "Tu Nombre"                 # ✅ Tu información
  status: draft                       # ✅ Estado inicial
```

### Paso 3: Completa los Bloques Fundacionales
- **Intent**: ¿Qué se quiere lograr?
- **Context**: ¿Dónde, cuándo, quién?
- **Authority**: ¿Quién respalda esto?
- **Evaluation**: ¿Cómo se mide el éxito?

### Paso 4: Reemplaza TODOS los Placeholders
- Busca `[texto-entre-corchetes]` y reemplaza
- Elimina secciones opcionales que no uses
- Mantén solo lo relevante para tu caso

### Paso 5: Valida y Revisa
- Usa la extensión VSCode SOL para validación
- Verifica que no queden placeholders
- Asegúrate de que las referencias sean válidas

## ✅ Beneficios de Usar los Templates

### 🎯 **Consistencia Garantizada**
- Estructura uniforme en todos los artefactos
- Campos obligatorios claramente identificados
- Comentarios explicativos en cada sección

### 🧠 **Reducción de Alucinaciones AI**
- Formato estandarizado que los LLMs entienden mejor
- Estructura predecible y bien documentada
- Validación automática de formato

### 👥 **Mejor Experiencia para Desarrolladores**
- Comentarios detallados línea por línea
- Ejemplos prácticos en cada campo
- Checklists de completitud visual

### 📊 **Trazabilidad Mejorada**
- Sección dedicada a relaciones entre artefactos
- Sistema de clasificación consistente
- Metadatos estructurados para búsqueda

## 🔍 Características Avanzadas

### 📋 **Sistema de Validación Visual**
Cada template incluye indicadores de estado:
```yaml
# ✅ VALIDATION STATUS
# ├─ 🟡 Syntax: Template (Requires customization)
# ├─ 🟡 Dependencies: Template (Requires customization)
# └─ 🟡 Review: Pending (Requires customization)
```

### 🎨 **Organización Visual Mejorada**
Uso de cajas Unicode para mejor legibilidad:
```yaml
# ┌─ METADATA ─────────────────────────────┐
# ├─ CORE FOUNDATIONAL BLOCKS ─────────────┤
# └─ CLASSIFICATION ───────────────────────┘
```

### 💡 **Comentarios Contextuales**
Cada campo incluye:
- Explicación de propósito
- Ejemplos prácticos
- Indicadores de obligatoriedad (REQUIRED/OPTIONAL)

## 📚 Referencias

- [README Principal de Templates](./README.md)
- [Documentación de Artefactos](../artifacts/README.md)
- [Esquema JSON SOL](../../extension/schemas/sol-schema.json)

---
**Versión:** v0.0.3-dev  
**Creado:** Enero 2025  
**Mantenido por:** Equipo SOL 