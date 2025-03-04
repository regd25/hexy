La separación de capas Aplicación, Infraestructura y Dominio que menciono se puede aplicar en dos niveles:
	1.	Dentro del framework de DI que estás construyendo en Hexy
	•	Aquí defines las reglas de cómo los desarrolladores van a organizar sus dependencias y módulos.
	•	No es necesario que el framework implemente directamente estas capas, pero sí debe proporcionar las herramientas para que los usuarios lo hagan.
	2.	En los proyectos que van a implementar el framework (usuarios de Hexy)
	•	Aquí es donde realmente se aplicará la separación de capas para seguir una arquitectura hexagonal.
	•	El framework debería permitir que los desarrolladores organicen su código en Application, Domain e Infrastructure de manera natural.

Cómo separar las capas en los proyectos que usan Hexy

La idea es que el framework facilite la estructura sin imponerla rígidamente. Puedes hacer esto recomendando una estructura de carpetas y módulos dentro del framework.

Estructura Sugerida en un Proyecto Usando Hexy

Imagina que alguien usa Hexy para un sistema de pedidos. La estructura quedaría así:

/src
  /application      -> Casos de uso, orquestación de lógica de dominio
    /services
      order.service.ts
      payment.service.ts
  /domain          -> Entidades, Value Objects, Agregados, Repositorios abstractos
    /entities
      order.ts
      product.ts
    /services
      order-domain.service.ts
  /infrastructure  -> Implementaciones de repositorios, adaptadores, API externas
    /persistence
      order.repository.ts
      user.repository.ts
    /http
      payment-api.ts
  /config
    di-container.ts

En este caso:
	•	Application Layer: Orquesta casos de uso. OrderService recibe una orden y decide qué debe hacer (order.service.ts).
	•	Domain Layer: Aquí viven los entidades, agregados y lógica de negocio pura (order.ts, order-domain.service.ts).
	•	Infrastructure Layer: Implementaciones concretas como bases de datos, APIs, y frameworks externos (order.repository.ts, payment-api.ts).

Cómo lo soporta tu framework de DI en Hexy

Para facilitar que los desarrolladores separen bien las capas, Hexy puede soportarlo de varias formas:

1️⃣ Definir Módulos para Separar Capas

Podrías permitir que los módulos indiquen explícitamente si son de aplicación, dominio o infraestructura:

@ModuleDecorator({
  providers: [OrderApplicationService],
  imports: [DomainModule, InfrastructureModule],
})
export class ApplicationModule {}

@ModuleDecorator({
  providers: [OrderDomainService, OrderRepository],
})
export class DomainModule {}

@ModuleDecorator({
  providers: [PostgresDataSource, RedisOrderRepository],
  exports: [OrderRepository], // Solo expone la interfaz, no la implementación
})
export class InfrastructureModule {}

Aquí Hexy permite organizar el código en capas sin forzarlo.

2️⃣ Imponer Buenas Prácticas con Decoradores

Puedes agregar decoradores para asegurar que los servicios están en la capa correcta:

@ApplicationService()
export class OrderApplicationService {
  constructor(private readonly orderDomainService: OrderDomainService) {}
}

@DomainService()
export class OrderDomainService {
  processOrder(order: Order) { /* lógica de negocio */ }
}

@InfrastructureService()
export class OrderRepositoryImpl implements OrderRepository {
  save(order: Order) { /* persistencia */ }
}

Hexy podría validar esto para evitar que alguien use un Repositorio en la capa de Aplicación.

3️⃣ Inyección Basada en Interfaces

Para evitar acoplamiento, en la capa de dominio se definen interfaces de repositorio, mientras que la capa de infraestructura proporciona la implementación:

export interface OrderRepository {
  save(order: Order): Promise<void>;
}

Y en la infraestructura:

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  save(order: Order) {
    // Implementación de persistencia
  }
}

Después en el contenedor de inyección de dependencias, se resuelve la interfaz con la implementación:

@ModuleDecorator({
  providers: [{ provide: OrderRepository, useClass: RedisOrderRepository }],
})
export class InfrastructureModule {}

Conclusión
	•	Hexy no necesita imponer estas capas en su implementación, pero sí debe facilitar que los proyectos las separen naturalmente.
	•	Con decoradores (@ApplicationService, @DomainService) y módulos (ApplicationModule, DomainModule), Hexy puede ayudar a organizar el código.
	•	La inyección de dependencias debe ser por interfaces (OrderRepository → OrderRepositoryImpl) para reducir acoplamiento.

Con esto, el framework Hexy se adapta bien a la arquitectura hexagonal y DDD, permitiendo que los equipos estructuren su código de forma flexible pero manteniendo buenas prácticas. 🚀