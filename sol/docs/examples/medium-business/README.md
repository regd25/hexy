# Medium Business: Distribuidora de Abarrotes

## 🏪 Contexto Empresarial

**AbarrotesMax** es una distribuidora mediana del sector abarrotes que maneja procesos manuales y semi-automatizados. Gestiona una cartera de 200+ clientes minoristas, rutas de entrega diarias, inventario de 500+ productos, y cobranza con diferentes modalidades de pago. La empresa busca optimizar operaciones manteniendo la flexibilidad de procesos manuales.

## 🎯 Visiones Estratégicas

### Vision: ExcelenciaDistribucion
```yaml
Vision:
  id: ExcelenciaDistribucion
  content: >
    Garantizar entregas puntuales y completas a todos los clientes, 
    optimizando rutas y manteniendo niveles de inventario adecuados.
  author: GerenteOperaciones
  date: 2025-01-15
  language: es
  tags: [logistica, puntualidad, satisfaccion-cliente]
```

### Vision: SaludFinanciera
```yaml
Vision:
  id: SaludFinanciera
  content: >
    Mantener flujo de caja positivo mediante gestión eficiente de cobranza 
    y control de cartera vencida menor al 5%.
  author: GerenteFinanciero
  date: 2025-01-15
  language: es
  tags: [cobranza, flujo-caja, cartera]
```

## 🧠 Conceptos Fundamentales

### Concept: Cliente
```yaml
Concept:
  id: Cliente
  description: >
    Establecimiento minorista con historial crediticio, ubicación geográfica 
    y patrón de compra establecido.
  usedIn: [GestionPedidos, RutasEntrega, Cobranza]
  vision: ExcelenciaDistribucion
  linkedPolicies: [EvaluacionCredito, PoliticaDescuentos]
  tags: [minorista, credito]
```

### Concept: ProductoAbarrote
```yaml
Concept:
  id: ProductoAbarrote
  description: >
    Mercancía de consumo masivo con código, precio, stock mínimo 
    y rotación definida.
  usedIn: [GestionInventario, Pedidos, Facturacion]
  vision: ExcelenciaDistribucion
  relatedIndicators: [RotacionInventario, StockDisponible]
  tags: [producto, inventario]
```

### Concept: RutaEntrega
```yaml
Concept:
  id: RutaEntrega
  description: >
    Secuencia optimizada de clientes para entrega diaria, 
    considerando ubicación geográfica y capacidad de vehículo.
  usedIn: [PlanificacionRutas, Entregas, ControlCombustible]
  vision: ExcelenciaDistribucion
  linkedProcesses: [OptimizacionRutas, EjecucionEntregas]
  tags: [logistica, optimizacion]
```

## 🏢 Dominios Operacionales

### Domain: GestionDistribucion
```yaml
Domain:
  id: GestionDistribucion
  description: >
    Coordinación integral de pedidos, inventario, rutas de entrega 
    y seguimiento de entregas para maximizar eficiencia operativa.
  vision: ExcelenciaDistribucion
  policies: [ReabastecimientoAutomatico, OptimizacionRutas, ValidacionEntregas]
  processes: [ProcesoPedidos, PlanificacionRutas, EjecucionEntregas]
  indicators: [PuntualidadEntregas, RotacionInventario, EficienciaRutas]
  timeScope: "operacion-diaria"
  audience: [Vendedor, Chofer, Almacenista, SupervisorRutas]
```

### Domain: GestionCobranza
```yaml
Domain:
  id: GestionCobranza
  description: >
    Administración de cuentas por cobrar, seguimiento de pagos 
    y gestión de cartera vencida para mantener salud financiera.
  vision: SaludFinanciera
  policies: [EvaluacionCredito, EscalacionCobranza, BloqueoCredito]
  processes: [SeguimientoPagos, GestionCarteraVencida, RecuperacionCredito]
  indicators: [CarteraVencida, DiasPromedioCobranza, EfectividadCobranza]
  governance: ComiteCredito
```

## 👥 Actores del Sistema

### Actor: Vendedor
```yaml
Actor:
  id: Vendedor
  type: human
  capabilities: [tomarPedidos, visitarClientes, negociarPrecios, gestionarCredito]
  domain: [GestionDistribucion, GestionCobranza]
  skills: [ventas, negociacion, conocimiento-productos]
  version: "vendedor-v1.0"
  owner: GerenteVentas
```

### Actor: Chofer
```yaml
Actor:
  id: Chofer
  type: human
  capabilities: [ejecutarRutas, entregarPedidos, cobrarContado, reportarIncidencias]
  domain: GestionDistribucion
  skills: [manejo, atencion-cliente, organizacion]
  version: "chofer-v1.0"
  owner: SupervisorRutas
```

### Actor: GestorCobranza
```yaml
Actor:
  id: GestorCobranza
  type: human
  capabilities: [contactarClientes, negociarPagos, reportarEstatus, escalarCasos]
  domain: GestionCobranza
  skills: [negociacion, comunicacion, persistencia]
  version: "cobrador-v1.0"
  owner: GerenteFinanciero
```

### Actor: SistemaInventario
```yaml
Actor:
  id: SistemaInventario
  type: system
  capabilities: [controlarStock, generarReportes, alertarReabastecimiento, calcularRotacion]
  domain: GestionDistribucion
  version: "inventory-sys-v2.1"
  owner: GerenteOperaciones
```

## 📋 Políticas Operacionales

### Policy: EvaluacionCredito
```yaml
Policy:
  id: EvaluacionCredito
  premise: >
    Si un cliente nuevo solicita crédito y presenta referencias comerciales válidas 
    con historial de pagos >= 80% puntual,
    entonces aprobar línea de crédito inicial de $10,000 pesos.
  vision: SaludFinanciera
  version: 2.0
  governance: ComiteCredito
  category: credito
  exceptions: [clientes-referidos-gerencia]
```

### Policy: ReabastecimientoAutomatico
```yaml
Policy:
  id: ReabastecimientoAutomatico
  premise: >
    Si un producto tiene stock actual <= stock mínimo definido 
    y rotación promedio >= 5 unidades/semana,
    entonces generar orden de compra automática por cantidad económica.
  vision: ExcelenciaDistribucion
  version: 1.5
  governance: GerenteOperaciones
  weight: alta
  category: inventario
```

### Policy: EscalacionCobranza
```yaml
Policy:
  id: EscalacionCobranza
  premise: >
    Si una cuenta tiene más de 30 días vencida y monto > $5,000 pesos 
    sin respuesta a 3 contactos del gestor,
    entonces escalar a gerente financiero para negociación directa.
  vision: SaludFinanciera
  version: 3.0
  governance: GerenteFinanciero
  category: cobranza
```

## ⚙️ Procesos Clave

### Process: ProcesoPedidos
```yaml
Process:
  id: ProcesoPedidos
  steps:
    - Actor:Vendedor → VisitarCliente
    - Actor:Vendedor → TomarPedido
    - Policy:EvaluacionCredito → ValidarLineaCredito
    - Actor:SistemaInventario → VerificarDisponibilidad
    - Actor:Almacenista → PrepararPedido
    - Actor:SistemaInventario → ActualizarStock
  vision: ExcelenciaDistribucion
  actors: [Vendedor, Almacenista, SistemaInventario]
  timeLimits: "procesamiento-max-2h"
  errorPaths: [producto-agotado, credito-bloqueado]
```

### Process: OptimizacionRutas
```yaml
Process:
  id: OptimizacionRutas
  steps:
    - Actor:SupervisorRutas → RecopilarPedidosDia
    - Actor:SupervisorRutas → AgruparPorZonaGeografica
    - Actor:SupervisorRutas → AsignarVehiculos
    - Actor:SupervisorRutas → OptimizarSecuenciaEntregas
    - Actor:Chofer → RecibirRutaAsignada
    - Actor:SistemaInventario → GenerarGuiasEntrega
  vision: ExcelenciaDistribucion
  actors: [SupervisorRutas, Chofer, SistemaInventario]
  alternatePaths: [ruta-emergencia, cliente-urgente]
```

### Process: GestionCarteraVencida
```yaml
Process:
  id: GestionCarteraVencida
  steps:
    - Actor:SistemaInventario → GenerarReporteVencimientos
    - Actor:GestorCobranza → ContactarClientesVencidos
    - Policy:EscalacionCobranza → EvaluarEscalacion
    - Actor:GestorCobranza → NegociarPlanPagos
    - Actor:GestorCobranza → DocumentarAcuerdos
    - Authority:ComiteCredito → AprobarConvenios si necesario
  vision: SaludFinanciera
  actors: [GestorCobranza, ComiteCredito]
  timeLimits: "seguimiento-semanal"
```

## 📊 Indicadores de Desempeño

### Indicator: PuntualidadEntregas
```yaml
Indicator:
  id: PuntualidadEntregas
  description: Porcentaje de entregas realizadas en tiempo prometido
  measurement: (entregasPuntuales / entregasTotales) * 100
  unit: "%"
  goal: 95
  warning: 90
  critical: 85
  domain: GestionDistribucion
  frequency: diaria
```

### Indicator: CarteraVencida
```yaml
Indicator:
  id: CarteraVencida
  description: Porcentaje de cartera con más de 30 días vencida
  measurement: (montoVencido30dias / carteraTotalCredito) * 100
  unit: "%"
  goal: 3
  warning: 5
  critical: 8
  domain: GestionCobranza
  frequency: semanal
```

### Indicator: RotacionInventario
```yaml
Indicator:
  id: RotacionInventario
  description: Número de veces que rota el inventario promedio mensual
  measurement: costoVentasMes / inventarioPromedio
  unit: "veces"
  goal: 6
  warning: 4
  critical: 3
  domain: GestionDistribucion
  frequency: mensual
```

## 🔔 Señales del Sistema

### Signal: AlertaStockBajo
```yaml
Signal:
  id: AlertaStockBajo
  sentBy: Actor:SistemaInventario
  sentTo: Actor:Almacenista
  basedOn: Policy:ReabastecimientoAutomatico
  channel: whatsapp
  type: AlertaInventario
  timestamp: 2025-01-28T08:30:00Z
  priority: alta
```

### Signal: NotificacionPagoVencido
```yaml
Signal:
  id: NotificacionPagoVencido
  sentBy: Actor:GestorCobranza
  sentTo: Concept:Cliente
  basedOn: Policy:EscalacionCobranza
  channel: telefono
  type: RecordatorioPago
  timestamp: 2025-01-28T10:15:00Z
  priority: media
  ackRequired: true
```

## 👁️ Observaciones del Sistema

### Observation: NivelInventario
```yaml
Observation:
  id: NivelInventario
  observedBy: Actor:Almacenista
  value: 25
  unit: "unidades"
  timestamp: 2025-01-28T07:00:00Z
  domain: GestionDistribucion
  tags: [producto-estrella, stock-critico]
```

### Observation: PagoRecibido
```yaml
Observation:
  id: PagoRecibido
  observedBy: Actor:GestorCobranza
  value: 15000
  unit: "pesos"
  timestamp: 2025-01-28T14:20:00Z
  domain: GestionCobranza
  tags: [pago-parcial, cliente-recuperado]
```

## 📋 Resultados Operacionales

### Result: EntregaCompletada
```yaml
Result:
  id: EntregaCompletada
  outcome: ClienteSatisfecho
  issuedBy: Actor:Chofer
  reason: Process:EjecucionEntregas
  timestamp: 2025-01-28T16:45:00Z
  severity: success
  tags: [entrega-puntual, pago-contado]
```

### Result: CreditoBloqueado
```yaml
Result:
  id: CreditoBloqueado
  outcome: SuspenderVentas
  issuedBy: Authority:ComiteCredito
  reason: Policy:EscalacionCobranza
  timestamp: 2025-01-28T11:30:00Z
  severity: warning
  nextDomain: RecuperacionCredito
```

## 🏛️ Autoridades de Gobierno

### Authority: ComiteCredito
```yaml
Authority:
  id: ComiteCredito
  role: supervisor
  approves: [Policy:EvaluacionCredito, Policy:EscalacionCobranza]
  scope: GestionFinanciera
  delegates: [evaluacion-rutinaria-a-gestor]
  escalationMatrix:
    - nivel1: GestorCobranza
    - nivel2: ComiteCredito
    - nivel3: GerenteGeneral
```

### Authority: SupervisorRutas
```yaml
Authority:
  id: SupervisorRutas
  role: coordinador
  approves: [Process:OptimizacionRutas, Policy:CambiosRuta]
  scope: LogisticaEntregas
  delegates: [asignacion-rutas-rutinarias]
  escalationMatrix:
    - nivel1: SupervisorRutas
    - nivel2: GerenteOperaciones
```

## 🤝 Protocolos de Interacción

### Protocol: CobranzaEscalonada
```yaml
Protocol:
  id: CobranzaEscalonada
  description: Secuencia progresiva de contacto para recuperación de cartera
  steps:
    - GestorCobranza: llamadaRecordatorio dia+1
    - GestorCobranza: visitaPersonal dia+7
    - GestorCobranza: cartaFormal dia+15
    - ComiteCredito: negociacionDirecta dia+30
    - GerenteGeneral: ultimaOportunidad dia+45
  timeout: "45-dias-maximo"
  fallback: proceso-juridico
  version: 2.0
```

### Protocol: EntregaEmergencia
```yaml
Protocol:
  id: EntregaEmergencia
  description: Procedimiento para entregas urgentes fuera de ruta programada
  steps:
    - Vendedor: solicitarEntregaUrgente
    - SupervisorRutas: evaluarFactibilidad
    - SupervisorRutas: asignarVehiculoDisponible
    - Chofer: ejecutarEntregaDirecta
    - SupervisorRutas: documentarCostoAdicional
  timeout: "4-horas-maximo"
  fallback: reprogramar-siguiente-dia
  version: 1.0
```

## 🎯 Flujo de Trabajo Típico

### Escenario: Gestión Completa de Pedido con Cobranza

1. **Toma de Pedido**
   - `Vendedor` visita `Cliente` y toma pedido por $8,500
   - `Policy:EvaluacionCredito` valida línea disponible
   - `SistemaInventario` confirma disponibilidad de productos

2. **Preparación y Entrega**
   - `Process:OptimizacionRutas` incluye cliente en ruta del día siguiente
   - `Almacenista` prepara pedido según guía generada
   - `Chofer` ejecuta entrega puntual y obtiene firma de recibido

3. **Seguimiento de Cobranza**
   - Día 30: `Policy:EscalacionCobranza` detecta vencimiento
   - `GestorCobranza` inicia `Protocol:CobranzaEscalonada`
   - Día 35: Cliente realiza pago parcial de $5,000
   - `Observation:PagoRecibido` actualiza saldo pendiente

4. **Resolución**
   - `GestorCobranza` negocia plan de pagos para saldo restante
   - `Authority:ComiteCredito` aprueba convenio de pago
   - `Indicator:CarteraVencida` se actualiza positivamente

## 📈 Métricas de Éxito

- **Puntualidad Entregas**: 96% (objetivo: 95%)
- **Cartera Vencida**: 4.2% (objetivo: <5%)
- **Rotación Inventario**: 5.8 veces/mes (objetivo: 6)
- **Efectividad Cobranza**: 87% (objetivo: 85%)
- **Clientes Activos**: 185 (crecimiento: 3% mensual)

## 🚀 Beneficios de Implementación SOL

1. **Procesos Híbridos**: Combina eficientemente operaciones manuales y automatizadas
2. **Trazabilidad Financiera**: Cada decisión de crédito está documentada y justificada
3. **Optimización Logística**: Rutas y entregas optimizadas sin perder flexibilidad
4. **Gestión Proactiva**: Políticas permiten anticipar problemas de inventario y cobranza
5. **Escalabilidad Controlada**: Estructura permite crecimiento manteniendo control operativo 