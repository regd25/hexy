import { NavigationRepository } from '../../domain/repositories/NavigationRepository'
import { Navigation } from '../../domain/aggregates/Navigation'
import { NavigationItem } from '../../domain/entities/NavigationItem'
import { NavigationItemId } from '../../domain/value-objects/NavigationItemId'

export class InMemoryNavigationRepository implements NavigationRepository {
  private navigation: Navigation

  constructor() {
    // Initialize with SCL modules as defined in hexy.scl.yaml
    const moduleItems = [
      NavigationItem.create(
        'introduction',
        'Módulo 1: Introducción',
        '#introduction',
        'Posiciona a SCL como un lenguaje intermedio entre intención humana y ejecución técnica.',
        '📚',
        1
      ),
      NavigationItem.create(
        'philosophy',
        'Módulo 2: Filosofía y Principios',
        '#philosophy',
        'Define los axiomas fundacionales del lenguaje.',
        '🧠',
        2
      ),
      NavigationItem.create(
        'structure',
        'Módulo 3: Estructura del Lenguaje',
        '#structure',
        'Describe los artefactos de SCL y sus relaciones semánticas.',
        '🏗️',
        3
      ),
      NavigationItem.create(
        'process',
        'Módulo 4: Proceso de Definición',
        '#process',
        'Guía paso a paso la construcción contextual de sistemas usando SCL.',
        '⚙️',
        4
      ),
      NavigationItem.create(
        'syntax',
        'Módulo 5: Sintaxis',
        '#syntax',
        'Explica cómo se estructura formalmente un archivo SCL y cómo se exporta.',
        '💻',
        5
      ),
      NavigationItem.create(
        'interpretation',
        'Módulo 6: Interpretación',
        '#interpretation',
        'Muestra cómo humanos y agentes entienden un sistema SCL.',
        '🔍',
        6
      ),
      NavigationItem.create(
        'integrations',
        'Módulo 7: Integraciones',
        '#integrations',
        'Define cómo SCL se conecta con herramientas del ecosistema técnico.',
        '🔗',
        7
      ),
      NavigationItem.create(
        'contribution',
        'Módulo 8: Contribución',
        '#contribution',
        'Estructura el proceso de colaboración y gobernanza del lenguaje.',
        '🤝',
        8
      )
    ]

    this.navigation = Navigation.create(moduleItems)
  }

  async findAll(): Promise<Navigation> {
    return this.navigation
  }

  async findById(id: NavigationItemId): Promise<NavigationItem | null> {
    return this.navigation.getItem(id) || null
  }

  async save(navigation: Navigation): Promise<void> {
    this.navigation = navigation
  }

  async getModuleNavigation(): Promise<Navigation> {
    return this.navigation
  }
} 