# Empresa Tradicional - Servicio de Limpieza de Casas

## Contexto Empresarial

**CleanPro Services** es una empresa tradicional de limpieza residencial que busca digitalizar y optimizar sus operaciones. La empresa maneja rutas de servicio, control de calidad y asignación de personal técnico especializado.

## Visiones Estratégicas

```yaml
# Visión Principal
Vision:
  id: ExcelenciaEnLimpieza
  content: >
    Brindar servicios de limpieza excepcionales que superen 
    las expectativas de nuestros clientes, manteniendo los 
    más altos estándares de calidad y puntualidad.
  author: GerenciaOperativa
  date: 2025-01-15
  language: es
  tags: [calidad, servicio, excelencia]

# Visión de Soporte
Vision:
  id: OptimizacionRutas
  content: >
    Maximizar la eficiencia operativa mediante la optimización 
    de rutas de servicio, reduciendo tiempos de traslado y 
    aumentando la capacidad de atención diaria.
  author: EquipoLogistica
  date: 2025-01-15
  language: es
  tags: [eficiencia, logistica, optimizacion]
```

## Conceptos Fundamentales

```yaml
Concept:
  id: ServicioLimpieza
  description: >
    Actividad profesional que comprende la limpieza, organización 
    y mantenimiento de espacios residenciales, incluyendo el uso 
    de equipos especializados y productos de limpieza apropiados.
  tags: [servicio, limpieza, mantenimiento]
  usedIn: [Policy:EvaluacionCalidad, Process:EjecucionServicio]

Concept:
  id: TecnicoLimpieza
  description: >
    Profesional capacitado en técnicas de limpieza especializada, 
    manejo de equipos y productos químicos, con certificaciones 
    en seguridad laboral y atención al cliente.
  tags: [personal, tecnico, capacitacion]
  usedIn: [Actor:TecnicoAsignado, Policy:RequisitosCertificacion]

Concept:
  id: RutaOptima
  description: >
    Secuencia de ubicaciones geográficas ordenada para minimizar 
    tiempo de traslado y maximizar eficiencia operativa, 
    considerando factores como tráfico, distancia y disponibilidad.
  tags: [logistica, optimizacion, eficiencia]
  usedIn: [Process:PlanificacionRutas, Indicator:TiempoTraslado]
```

## Dominios Operativos

```yaml
# Dominio Principal
Domain:
  id: GestionCalidadServicio
  description: >
    Sistema integral de control y aseguramiento de calidad 
    en servicios de limpieza, desde la planificación hasta 
    la evaluación post-servicio.
  vision: ExcelenciaEnLimpieza
  policies: 
    - EvaluacionPostServicio
    - CriteriosCalidadMinima
    - EscalacionIncidencias
  processes:
    - EjecucionServicioCompleto
    - InspeccionCalidad
    - CorreccionDeficiencias
  indicators:
    - IndiceCalidadServicio
    - SatisfaccionClientePromedio
    - TasaReincidenciaProblemas
  audience: [SupervisorCalidad, GerenciaOperativa]
  governance: CertificacionISO

# Dominio de Soporte
Domain:
  id: OptimizacionLogistica
  description: >
    Gestión eficiente de rutas, recursos y tiempos para 
    maximizar la productividad operativa del equipo de limpieza.
  vision: OptimizacionRutas
  policies:
    - OptimizacionRutaDiaria
    - AsignacionOptima
    - LimiteTiempoTraslado
  processes:
    - PlanificacionRutasSemanales
    - MonitoreoTiempos
    - AjusteDinamico
  indicators:
    - TiempoPromedioTraslado
    - PorcentajeOcupacionTecnicos
    - EficienciaRutas
  audience: [CoordinadorLogistica, SupervisorRutas]
  timeScope: semanal
```

## Actores del Sistema

```yaml
# Actores Humanos
Actor:
  id: TecnicoLimpiezaResidencial
  type: human
  capabilities: 
    - ejecutarProtocolosLimpieza
    - manejarEquipoEspecializado
    - interactuarConClientes
    - documentarIncidencias
    - realizarInspeccionCalidad
  domain: GestionCalidadServicio
  skills: [LimpiezaProfunda, ManejoQuimicos, AtencionCliente]
  owner: SupervisorOperaciones

Actor:
  id: SupervisorCalidad
  type: human
  capabilities:
    - evaluarCalidadServicio
    - aprobarCompletitudTareas
    - gestionarIncidencias
    - capacitarTecnicos
    - reportarMetricas
  domain: GestionCalidadServicio
  skills: [ControlCalidad, Liderazgo, ResolucionProblemas]
  owner: GerenciaOperativa

Actor:
  id: CoordinadorLogistica
  type: human
  capabilities:
    - planificarRutas
    - asignarRecursos
    - optimizarTiempos
    - coordinarEquipos
    - gestionarEmergencias
  domain: OptimizacionLogistica
  skills: [AnalisisGeoespacial, GestionEquipos, ResolucionProblemas]
  owner: GerenciaOperativa

# Actores Tecnológicos
Actor:
  id: AppMovilTecnicos
  type: system
  capabilities:
    - capturarUbicacionGPS
    - registrarTiempos
    - tomarFotografias
    - completarChecklists
    - sincronizarDatos
  domain: GestionCalidadServicio
  version: 2.1.3
  owner: EquipoTecnologia

Actor:
  id: AlgoritmoOptimizacionRutas
  type: aiModel
  capabilities:
    - calcularRutasOptimas
    - considerarRestricciones
    - adaptarseATrafico
    - predecirTiempos
    - optimizarCostos
  domain: OptimizacionLogistica
  version: 1.5.2
  owner: EquipoDataScience
```

## Políticas de Negocio

```yaml
Policy:
  id: EvaluacionPostServicio
  premise: >
    Si un servicio de limpieza se completa sin incidencias reportadas,
    entonces enviar encuesta de satisfacción al cliente dentro de 2 horas
    y programar seguimiento telefónico en 24 horas.
  vision: ExcelenciaEnLimpieza
  version: 1.2
  governance: ISO9001
  category: calidad
  weight: 8

Policy:
  id: EscalacionIncidencias
  premise: >
    Si durante un servicio se detecta una incidencia que afecta la calidad,
    entonces suspender el servicio, notificar al supervisor inmediatamente
    y no facturar hasta resolver satisfactoriamente.
  vision: ExcelenciaEnLimpieza
  version: 1.0
  governance: PoliticaCalidad
  category: operativa
  weight: 10

Policy:
  id: OptimizacionRutaDiaria
  premise: >
    Si la diferencia entre ruta planificada y ruta óptima supera 15% en tiempo,
    entonces recalcular automáticamente y notificar cambios a técnicos
    con al menos 30 minutos de anticipación.
  vision: OptimizacionRutas
  version: 2.0
  governance: SistemaLogistico
  category: operativa
  weight: 7
```

## Procesos Clave

```yaml
Process:
  id: EjecucionServicioCompleto
  steps:
    - Actor:TecnicoLimpieza → LlegarUbicacion
    - Actor:TecnicoLimpieza → RegistrarInicioServicio
    - Actor:TecnicoLimpieza → EjecutarProtocoloLimpieza
    - System:AppMovil → CapturarFotosAntesDespues
    - Policy:EvaluacionCalidad → ValidarEstandaresCalidad
    - Actor:TecnicoLimpieza → CompletarChecklistServicio
    - Actor:Cliente → ConfirmarSatisfaccion
    - System:ERP → GenerarFacturacion
  vision: ExcelenciaEnLimpieza
  actors: [TecnicoLimpieza, Cliente, SupervisorCalidad]
  timeLimits:
    totalProcess: 4 hours
    stepTimeout: 30 minutes
  errorPaths:
    - IncidenciaCalidad → EscalarSupervisor
    - ClienteAusente → ReprogramarServicio

Process:
  id: PlanificacionRutasSemanales
  steps:
    - Actor:CoordinadorLogistica → RecopilarSolicitudesServicio
    - System:AlgoritmoOptimizacion → CalcularRutasOptimas
    - Policy:CapacidadMaximaTecnicos → ValidarDisponibilidad
    - Actor:CoordinadorLogistica → AsignarTecnicosRutas
    - System:AppMovil → NotificarAsignaciones
    - Actor:TecnicoLimpieza → ConfirmarDisponibilidad
    - Actor:CoordinadorLogistica → PublicarRutasFinales
  vision: OptimizacionRutas
  actors: [CoordinadorLogistica, TecnicoLimpieza]
  timeLimits:
    totalProcess: 2 hours
  alternatePaths:
    - TecnicoNoDisponible → ReasignarAutomatico
```

## Indicadores de Desempeño

```yaml
Indicator:
  id: IndiceCalidadServicio
  description: >
    Porcentaje de servicios completados que superan los 
    estándares mínimos de calidad establecidos
  measurement: (serviciosAprobados / serviciosTotales) * 100
  unit: "%"
  goal: 95
  domain: GestionCalidadServicio
  warning: 90
  critical: 85
  frequency: daily

Indicator:
  id: TiempoPromedioTraslado
  description: >
    Tiempo promedio de traslado entre ubicaciones de servicio
    en rutas programadas
  measurement: sumaTimeposTraslado / numeroTraslados
  unit: "minutes"
  goal: 25
  domain: OptimizacionLogistica
  warning: 30
  critical: 35
  frequency: daily

Indicator:
  id: SatisfaccionClientePromedio
  description: >
    Puntuación promedio de satisfacción del cliente 
    basada en encuestas post-servicio
  measurement: sumaCalificaciones / numeroEncuestas
  unit: "score"
  goal: 4.5
  domain: GestionCalidadServicio
  warning: 4.0
  critical: 3.5
  frequency: weekly
```

## Autoridades de Gobierno

```yaml
Authority:
  id: SupervisorCalidadOperativo
  role: approver
  approves: 
    - Policy:EvaluacionPostServicio
    - Policy:CriteriosCalidadMinima
    - Process:InspeccionCalidad
  scope: GestionCalidadServicio
  delegates: [SupervisorTurno, LiderEquipo]
  escalationMatrix:
    incidenciasCriticas: GerenciaOperativa
    reclamosClientes: AtencionCliente

Authority:
  id: GerenciaOperativa
  role: governor
  approves:
    - Policy:OptimizacionRutaDiaria
    - Policy:AsignacionRecursos
    - Domain:OptimizacionLogistica
  scope: OperacionesGenerales
  delegates: [SupervisorCalidad, CoordinadorLogistica]
  escalationMatrix:
    decisionesEstrategicas: DireccionGeneral
    conflictosRecursos: ComiteOperativo
```

## Protocolos de Comunicación

```yaml
Protocol:
  id: GestionIncidenciaCalidad
  description: >
    Secuencia de comunicación y resolución cuando se detecta 
    una incidencia que afecta la calidad del servicio
  steps:
    - TecnicoLimpieza: reportarIncidencia
    - SupervisorCalidad: evaluarSeveridad
    - SupervisorCalidad: decidirAccionCorrectiva si severidadAlta
    - TecnicoLimpieza: implementarCorreccion
    - SupervisorCalidad: verificarResolucion
    - Cliente: confirmarSatisfaccion
  timeout: 2 hours
  fallback: EscalacionGerenciaOperativa
  version: 1.2

Protocol:
  id: CoordinacionRutasDiarias
  description: >
    Comunicación matutina para coordinar rutas y asignaciones 
    del día entre coordinador logístico y técnicos
  steps:
    - CoordinadorLogistica: enviarAsignacionesDiarias
    - TecnicoLimpieza: confirmarRecepcionAsignacion
    - TecnicoLimpieza: reportarDisponibilidad
    - CoordinadorLogistica: ajustarRutas si cambiosNecesarios
    - TecnicoLimpieza: confirmarRutaFinal
    - CoordinadorLogistica: activarMonitoreoGPS
  timeout: 30 minutes
  fallback: AsignacionAutomaticaPorDefecto
  version: 2.0
```

## Flujo de Trabajo Típico

### Día de Operación

1. **06:00** - `CoordinadorLogistica` ejecuta `Protocol:CoordinacionRutasDiarias`
2. **07:00** - `TecnicoLimpieza` recibe asignaciones y confirma disponibilidad
3. **08:00** - Inicio de `Process:EjecucionServicioCompleto` en primera ubicación
4. **Durante el día** - `System:AppMovil` monitorea progreso y captura evidencias
5. **Si incidencia** - Se activa `Protocol:GestionIncidenciaCalidad`
6. **Post-servicio** - `Policy:EvaluacionPostServicio` dispara encuesta automática
7. **Final del día** - `Indicator:IndiceCalidadServicio` se actualiza automáticamente

### Escalación de Problemas

- **Incidencia Menor**: Técnico → SupervisorTurno
- **Incidencia Mayor**: Técnico → SupervisorCalidad → GerenciaOperativa
- **Cliente Insatisfecho**: SupervisorCalidad → AtencionCliente → GerenciaComercial

## Beneficios de la Implementación SOL

1. **Trazabilidad Completa**: Cada acción está vinculada a una visión estratégica
2. **Automatización Inteligente**: Políticas claras permiten automatización confiable
3. **Mejora Continua**: Indicadores proporcionan feedback para optimización
4. **Governance Claro**: Autoridades bien definidas para toma de decisiones
5. **Comunicación Estructurada**: Protocolos formalizan interacciones clave

## Métricas de Éxito

- **Calidad**: 95% de servicios aprobados en primera inspección
- **Eficiencia**: 25 minutos promedio de traslado entre ubicaciones
- **Satisfacción**: 4.5/5.0 puntuación promedio de clientes
- **Productividad**: 85% de ocupación efectiva de técnicos
- **Incidencias**: Resolución en menos de 2 horas promedio 