# 📛 Convención de nombres de archivos en Hexy

> Esta convención aplica al diseño actual de Hexy, sin carpetas por layers, usando sufijos semánticos para cada tipo de clase o archivo.

| Carpeta                      | Tipo de Clase / Archivo      | Sufijo del archivo         | Ejemplo                              |
|-----------------------------|-------------------------------|-----------------------------|--------------------------------------|
| `aggregate/`                | Aggregate                     | `.aggregate.ts`            | `invoice.aggregate.ts`               |
| `entity/`                   | Entity                        | `.entity.ts`               | `invoice-line.entity.ts`             |
| `value-object/`             | Value Object                  | `.value-object.ts`         | `username.value-object.ts`           |
| `specification/`            | Specification                 | `.specification.ts`        | `is-active.specification.ts`         |
| `factory/`                  | Factory                       | `.factory.ts`              | `user.factory.ts`                    |
| `repository/`               | Repository (abstracta)        | `.repository.ts`           | `user.repository.ts`                 |
| `port/`                     | Puerto (contrato)             | `.port.ts`                 | `email-sender.port.ts`               |
| `use-case/`                 | UseCase                       | `.usecase.ts`              | `generate-invoice.usecase.ts`        |
| `event/`                    | Domain Event                  | `.event.ts`                | `user-registered.event.ts`           |
| `event-handler/`            | Event Handler                 | `.event-handler.ts`        | `send-welcome.event-handler.ts`      |
| `service/`                  | Domain Service                | `.service.ts`              | `invoice.service.ts`                 |
| `controller/`               | HTTP Controller               | `.controller.ts`           | `user.controller.ts`                 |
| `adapter/ws/handler/`       | WebSocket Handler             | `.ws-handler.ts`           | `user-typing.ws-handler.ts`          |
| `adapter/<tech>/`           | Adaptador externo             | `.adapter.ts`              | `sendgrid.adapter.ts`                |
| `dto/`                      | DTO                           | `.dto.ts`                  | `register-user.dto.ts`               |
| `config/`                   | Parámetros de configuración   | `parameters.ts`            | `parameters.ts`                      |
| `config/`                   | Secretos                      | `secrets.ts`               | `secrets.ts`                         |
| cualquiera                  | Prueba unitaria o integración | `.spec.ts`                 | `generate-invoice.usecase.spec.ts`   |