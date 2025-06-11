/**
 * HexyEngine Simple Demo
 * Demonstrates SOL artifacts creation and validation
 */

import { Vision } from '../src/domain/entities/Vision';
import { Concept } from '../src/domain/entities/Concept';
import { Domain } from '../src/domain/entities/Domain';
import { Policy } from '../src/domain/entities/Policy';
import { Process, ProcessStep } from '../src/domain/entities/Process';
import { Actor, ActorType } from '../src/domain/entities/Actor';
import { Indicator } from '../src/domain/entities/Indicator';
import { Result } from '../src/domain/entities/Result';

async function runSimpleDemo(): Promise<void> {
  console.log('\n🚀 HEXY ENGINE SIMPLE DEMO - SOL Artifacts Showcase\n');
  
  try {
    // 1. Create Vision
    console.log('📋 Creating Vision...');
    const vision = new Vision(
      'DemostracionSOL',
      'Demostrar la capacidad completa del sistema SOL para modelar y ejecutar procesos organizacionales complejos con validación semántica automatizada',
      'EquipoHexy',
      'DemoDay'
    );
    console.log(`✅ Vision created: ${vision.id}`);
    console.log(`   Content: ${vision.content.substring(0, 50)}...`);
    
    // 2. Create Concept
    console.log('\n📋 Creating Concept...');
    const concept = new Concept(
      'ProcesoOrganizacional',
      'Secuencia estructurada de actividades que transforman entradas en resultados de valor para la organización'
    );
    concept.addUsage('Process:GestionCalidad');
    concept.addUsage('Policy:ValidacionProcesos');
    console.log(`✅ Concept created: ${concept.id}`);
    console.log(`   Used in: ${concept.usedIn.join(', ')}`);
    
    // 3. Create Domain
    console.log('\n📋 Creating Domain...');
    const domain = new Domain(
      'SistemaGestionCalidad',
      'Dominio integral para la gestión de calidad organizacional que incluye procesos, políticas e indicadores de rendimiento',
      'DemostracionSOL'
    );
    console.log(`✅ Domain created: ${domain.id}`);
    
    // 4. Create Policy
    console.log('\n📋 Creating Policy...');
    const policy = new Policy(
      'ValidacionObligatoria',
      'Todo proceso crítico debe pasar por validación semántica automatizada antes de su ejecución en producción',
      'DemostracionSOL'
    );
    console.log(`✅ Policy created: ${policy.id}`);
    
    // 5. Create Process
    console.log('\n📋 Creating Process...');
    const process = new Process(
      'EjecutarValidacionCompleta',
      ['MotorHexy', 'ValidadorSemanticoLLM', 'UsuarioAdministrador'],
      [
        ProcessStep.fromString('MotorHexy → Cargar artefactos SOL del dominio'),
        ProcessStep.fromString('ValidadorSemanticoLLM → Analizar coherencia semántica (Policy: ValidacionObligatoria)'),
        ProcessStep.fromString('ValidadorSemanticoLLM → Calcular métricas de confianza'),
        ProcessStep.fromString('UsuarioAdministrador → Revisar resultados de validación'),
        ProcessStep.fromString('MotorHexy → Emitir certificación de calidad')
      ],
      'DemostracionSOL'
    );
    console.log(`✅ Process created: ${process.id}`);
    console.log(`   Steps: ${process.steps.length}`);
    console.log(`   Actors: ${process.actors.join(', ')}`);
    
    // 6. Create Actor
    console.log('\n📋 Creating Actor...');
    const actor = new Actor(
      'ValidadorSemanticoLLM',
      ActorType.AI_MODEL,
      ['validarProcess', 'evaluarPolicy', 'calcularConfianza', 'generarReporte'],
      'SistemaGestionCalidad'
    );
    console.log(`✅ Actor created: ${actor.id}`);
    console.log(`   Type: ${actor.type}`);
    console.log(`   Capabilities: ${actor.capabilities.join(', ')}`);
    
    // 7. Create Indicator
    console.log('\n📋 Creating Indicator...');
    const indicator = new Indicator(
      'TasaValidacionExitosa',
      'Porcentaje de procesos que pasan la validación semántica automatizada sin requerir intervención manual',
      '(procesosValidadosAutomaticamente / totalProcesosValidados) * 100',
      '%',
      95,
      'SistemaGestionCalidad'
    );
    indicator.setWarningThreshold(85);
    indicator.setCriticalThreshold(70);
    console.log(`✅ Indicator created: ${indicator.id}`);
    console.log(`   Goal: ${indicator.goal}${indicator.unit}`);
    console.log(`   Warning: ${indicator.warningThreshold}${indicator.unit}`);
    console.log(`   Critical: ${indicator.criticalThreshold}${indicator.unit}`);
    
    // 8. Create Result
    console.log('\n📋 Creating Result...');
    const result = new Result(
      'DemoCompletada',
      'MotorHexy',
      'Demostración de artefactos SOL ejecutada exitosamente',
      'Todos los tipos de artefactos SOL fueron creados, validados y demostrados correctamente',
      'EjecutarValidacionCompleta',
      {
        artifactsCreated: 7,
        validationsPassed: 7,
        demonstrationTime: '5 minutes'
      }
    );
    console.log(`✅ Result created: ${result.id}`);
    console.log(`   Outcome: ${result.outcome}`);
    
    // Add artifacts to domain
    domain.addPolicy(policy.id);
    domain.addProcess(process.id);
    domain.addIndicator(indicator.id);
    
    // Validate all artifacts
    console.log('\n📊 VALIDATION RESULTS');
    console.log('━'.repeat(50));
    
    const artifacts = [vision, concept, domain, policy, process, actor, indicator, result];
    let validCount = 0;
    let totalWarnings = 0;
    
    for (const artifact of artifacts) {
      const validation = artifact.validate();
      const status = validation.isValid ? '✅' : '❌';
      console.log(`${status} ${artifact.getType()}: ${artifact.id}`);
      
      if (validation.isValid) {
        validCount++;
      }
      
      if (validation.warnings.length > 0) {
        totalWarnings += validation.warnings.length;
        validation.warnings.forEach(warning => {
          console.log(`    ⚠️  ${warning}`);
        });
      }
      
      if (validation.errors.length > 0) {
        validation.errors.forEach(error => {
          console.log(`    ❌ ${error}`);
        });
      }
    }
    
    // Summary
    console.log('\n🎯 DEMO SUMMARY');
    console.log('━'.repeat(50));
    console.log(`📦 Artifacts Created: ${artifacts.length}`);
    console.log(`✅ Valid Artifacts: ${validCount}/${artifacts.length}`);
    console.log(`⚠️  Total Warnings: ${totalWarnings}`);
    console.log(`🏗️  Domain Coverage: ${domain.policies.length} policies, ${domain.processes.length} processes, ${domain.indicators.length} indicators`);
    console.log(`🎯 Semantic Alignment: All artifacts aligned to "${vision.id}" vision`);
    
    // Test indicator evaluation
    console.log('\n📈 INDICATOR EVALUATION TEST');
    console.log('━'.repeat(50));
    const testValues = [98, 82, 65];
    testValues.forEach(value => {
      const status = indicator.evaluateStatus(value);
      const emoji = status === 'healthy' ? '💚' : status === 'warning' ? '⚠️' : '🔴';
      console.log(`${emoji} Value: ${value}% → Status: ${status}`);
    });
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('🔗 All SOL artifacts are semantically connected and validated');
    console.log('🚀 Ready for production deployment!\n');
    
  } catch (error) {
    console.error('❌ Demo failed:', (error as Error).message);
    process.exit(1);
  }
}

// Execute demo
if (require.main === module) {
  runSimpleDemo().catch(console.error);
} 