# Hexy Framework

Hexy es un framework moderno para Node.js/TypeScript que implementa los principios de Domain-Driven Design (DDD) y Arquitectura Hexagonal.

## Características principales

- **Arquitectura hexagonal**: Separa claramente las capas de dominio, aplicación e infraestructura.
- **Domain-Driven Design**: Facilita la implementación de agregados, entidades, objetos de valor y repositorios.
- **Inyección de dependencias**: Sistema avanzado de DI con soporte para arquitectura por capas.
- **Event-Driven**: Publicación y manejo de eventos de dominio para comunicación entre componentes.
- **Serverless**: Soporte para entornos serverless mediante adaptadores.
- **CLI integrada**: Herramientas de línea de comandos para acelerar el desarrollo.

## Instalación

```bash
npm install @hexy/core
```

## Uso básico

### Arquitectura Hexagonal con DI orientada a capas

Hexy proporciona decoradores específicos para cada capa de la arquitectura hexagonal:

```typescript
// Capa de dominio - Contiene la lógica de negocio
@DomainService()
class ProductDomainService {
  validatePrice(price: number): boolean {
    return price > 0;
  }
}

// Capa de infraestructura - Implementa interfaces del dominio
@RepositoryImplementation()
class MongoProductRepository implements ProductRepository {
  // Implementación de base de datos
}

// Capa de aplicación - Orquesta casos de uso
@ApplicationService()
class CreateProductUseCase {
  constructor(
    private productRepository: ProductRepository,
    private productDomainService: ProductDomainService
  ) {}
  
  async execute(data: ProductData): Promise<Product> {
    // Lógica de aplicación
  }
}
```

### Organización de módulos por capas

```typescript
// Módulos específicos por capas
@DomainModule({
  providers: [ProductDomainService]
})
class ProductDomainModule {}

@InfrastructureModule({
  providers: [
    MongoProductRepository,
    { provide: ProductRepository, useClass: MongoProductRepository }
  ],
  imports: [ProductDomainModule]
})
class ProductInfrastructureModule {}

@ApplicationModule({
  providers: [CreateProductUseCase],
  imports: [ProductDomainModule, ProductInfrastructureModule]
})
class ProductApplicationModule {}
```

### Validación de dependencias entre capas

Hexy puede validar automáticamente la correcta separación de capas:

```typescript
const app = new Application();
app.registerModules([
  ProductDomainModule,
  ProductInfrastructureModule,
  ProductApplicationModule
]);

// Validar dependencias entre capas
const validationResult = app.validateLayerDependencies();
if (!validationResult.valid) {
  console.error('Violaciones de arquitectura detectadas:', validationResult.violations);
}
```

## Estructura de directorios recomendada

```
/src
  /domain            # Capa de dominio (entidades, agregados, reglas de negocio)
    /aggregate
    /service
    /repository      # Interfaces de repositorio
  /application       # Capa de aplicación (casos de uso, servicios de aplicación)
    /use-case
    /service
  /infrastructure    # Capa de infraestructura (adaptadores, implementaciones)
    /persistence
    /api
    /messaging
  /shared            # Componentes compartidos
    /domain
    /utils
```

## Documentación

Para la documentación completa, visite [la documentación oficial](https://docs.hexy.io).

## Contribuir

Las contribuciones son bienvenidas. Por favor, lea las [directrices de contribución](CONTRIBUTING.md) antes de enviar un pull request.

## Licencia

[MIT](LICENSE) 