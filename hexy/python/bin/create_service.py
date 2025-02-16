import os
import re
import argparse
from typing import List, Optional


def to_snake_case(name: str) -> str:
    """Convierte cualquier string a snake_case"""
    name = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    name = re.sub("([a-z0-9])([A-Z])", r"\1_\2", name)
    return name.lower()


def to_pascal_case(name: str) -> str:
    """Convierte cualquier string a PascalCase"""
    # Primero convertimos a snake_case para manejar cualquier formato
    snake = to_snake_case(name)
    return "".join(word.title() for word in snake.split("_"))


def create_service_structure(context: str, service_name: str) -> str:
    base_path = f"src/{to_snake_case(context)}/services/{to_snake_case(service_name)}"
    paths = [
        f"{base_path}/application",
        f"{base_path}/domain",
        f"{base_path}/infrastructure",
    ]
    for path in paths:
        os.makedirs(path, exist_ok=True)
        print(f"Creado directorio: {path}")
    return base_path


def create_value_object(base_path: str, vo_name: str, vo_type: str) -> None:
    vo_pascal = to_pascal_case(vo_name)
    vo_snake = to_snake_case(vo_name)
    
    # Mapeo de tipos a sus clases base
    type_mapping = {
        'string': 'StringValueObject',
        'integer': 'IntegerValueObject',
        'float': 'FloatValueObject',
        'boolean': 'BooleanValueObject',
        'uuid': 'UuidValueObject',
        'email': 'EmailValueObject',
        'phone': 'PhoneNumberValueObject',
        'money': 'MoneyValueObject',
        'number_id': 'NumberIdValueObject',
        'date': 'DateValueObject',
        'enum': 'EnumValueObject'
    }
    
    base_class = type_mapping.get(vo_type.lower(), 'ValueObject')
    
    with open(f"{base_path}/domain/{vo_snake}.py", "w") as f:
        f.write(f"""from src.shared.domain.value_objects import {base_class}

class {vo_pascal}({base_class}):
    def __init__(self, value):
        super().__init__(value)
""")
    print(f"Creado value object: {vo_pascal} ({base_class})")


def create_ddd_elements(
    base_path: str,
    aggregate: Optional[str],
    value_objects: List[str],
    use_cases: List[str],
    repository: Optional[str],
) -> None:
    # Crear __init__.py en cada directorio
    for dir_name in ["domain", "application", "infrastructure"]:
        with open(f"{base_path}/{dir_name}/__init__.py", "w") as f:
            f.write("")

    # Procesar value objects antes de crear el agregado
    vo_definitions = []
    for vo in value_objects:
        if ':' in vo:
            vo_name, vo_type = vo.split(':')
            vo_name = vo_name.strip()
            vo_type = vo_type.strip().lower()
            vo_definitions.append((vo_name, vo_type))

    # Crear agregado principal con todos sus value objects
    if aggregate:
        aggregate_pascal = to_pascal_case(aggregate)
        aggregate_snake = to_snake_case(aggregate)

        # Preparar imports y atributos
        vo_imports = []
        vo_init_params = []
        vo_assignments = []
        vo_primitives = []

        # Agregar UUID por defecto
        vo_imports.append("from src.shared.domain.value_objects import UuidValueObject")
        vo_init_params.append("id_: UuidValueObject")
        vo_assignments.append("self._id = id_")
        vo_primitives.append('"id": str(self._id.value)')

        # Agregar value objects definidos
        for vo_name, vo_type in vo_definitions:
            vo_snake = to_snake_case(vo_name)
            type_mapping = {
                'string': 'StringValueObject',
                'integer': 'IntegerValueObject',
                'float': 'FloatValueObject',
                'boolean': 'BooleanValueObject',
                'uuid': 'UuidValueObject',
                'email': 'EmailValueObject',
                'phone': 'PhoneNumberValueObject',
                'money': 'MoneyValueObject',
                'number_id': 'NumberIdValueObject',
                'date': 'DateValueObject',
                'enum': 'EnumValueObject'
            }
            vo_type_class = type_mapping.get(vo_type, 'ValueObject')
            vo_imports.append(f"from src.shared.domain.value_objects import {vo_type_class}")
            vo_init_params.append(f"{vo_snake}: {vo_type_class}")
            vo_assignments.append(f"self._{vo_snake} = {vo_snake}")
            vo_primitives.append(f'"{vo_snake}": str(self._{vo_snake}.value)')

        # Crear el agregado
        with open(f"{base_path}/domain/{aggregate_snake}.py", "w") as f:
            f.write(
                f"""from typing import Dict, Any
from src.shared.domain.aggregate_root import AggregateRoot
{chr(10).join(sorted(set(vo_imports)))}

class {aggregate_pascal}(AggregateRoot):
    def __init__(self, {', '.join(vo_init_params)}):
        super().__init__()
        {chr(10)        .join(vo_assignments)}
    
    @property
    def id(self) -> UuidValueObject:
        return self._id

    {chr(10).join(f'    @property{chr(10)}    def {to_snake_case(vo[0])}(self) -> {type_mapping[vo[1]]}:{chr(10)}        return self._{to_snake_case(vo[0])}' for vo in vo_definitions)}

    def to_primitives(self) -> Dict[str, Any]:
        return {{
            {',{chr(10)}            '.join(vo_primitives)}
        }}

    @classmethod
    def create(cls, {', '.join(vo_init_params)}) -> '{aggregate_pascal}':
        return cls({', '.join(param.split(':')[0] for param in vo_init_params)})
"""
            )
        print(f"Creado agregado: {aggregate_pascal}")

        # Configurar repositorio por defecto
        if not repository:
            repository = f"{aggregate_pascal}Repository"

    # Crear repositorio
    if repository:
        repo_pascal = to_pascal_case(repository)
        repo_snake = to_snake_case(repository)
        aggregate_pascal = to_pascal_case(aggregate) if aggregate else "Entity"

        with open(f"{base_path}/infrastructure/{repo_snake}.py", "w") as f:
            f.write(
                f"""from abc import ABC, abstractmethod
from typing import Optional, List
from src.shared.domain.criteria import Criteria
from ..domain.{aggregate_snake} import {aggregate_pascal}

class {repo_pascal}(ABC):
    @abstractmethod
    async def save(self, {aggregate_snake}: {aggregate_pascal}) -> None:
        pass

    @abstractmethod
    async def search(self, id_: str) -> Optional[{aggregate_pascal}]:
        pass

    @abstractmethod
    async def search_all(self) -> List[{aggregate_pascal}]:
        pass

    @abstractmethod
    async def matching(self, criteria: Criteria) -> List[{aggregate_pascal}]:
        pass
"""
            )
        print(f"Creado repositorio: {repo_pascal}")

    # Crear value objects
    for vo in value_objects:
        if ':' in vo:
            vo_name, vo_type = vo.split(':')
            # Asegurar que el nombre del VO está en el formato correcto
            vo_name = vo_name.strip()
            vo_type = vo_type.strip().lower()
            create_value_object(base_path, vo_name, vo_type)

    # Crear casos de uso
    for uc in use_cases:
        # Mantener la frase completa en snake_case para el archivo
        uc_snake = to_snake_case(uc)
        # Convertir a PascalCase para el nombre de la clase
        uc_pascal = to_pascal_case(uc)

        with open(f"{base_path}/application/{uc_snake}.py", "w") as f:
            f.write(
                f"""from typing import Optional
from ..domain.{to_snake_case(aggregate)} import {to_pascal_case(aggregate)}

class {uc_pascal}:
    def __init__(self):
        pass

    async def execute(self) -> Optional[{to_pascal_case(aggregate)}]:
        pass
"""
            )
        print(f"Creado caso de uso: {uc_pascal} en {uc_snake}.py")


def main():
    parser = argparse.ArgumentParser(description="Crear estructura de servicio DDD")
    parser.add_argument("--context", required=True, help="Nombre del contexto")
    parser.add_argument("--service-name", required=True, help="Nombre del servicio")
    parser.add_argument("--aggregate", help="Nombre del agregado")
    parser.add_argument(
        "--value-objects", nargs="*", default=[], help="Lista de value objects"
    )
    parser.add_argument(
        "--use-cases", nargs="*", default=[], help="Lista de casos de uso"
    )
    parser.add_argument("--repository", help="Nombre del repositorio")

    args = parser.parse_args()

    print("\nCreando estructura del servicio...")
    base_path = create_service_structure(args.context, args.service_name)
    create_ddd_elements(
        base_path, args.aggregate, args.value_objects, args.use_cases, args.repository
    )
    print("\n¡Servicio creado exitosamente!")


if __name__ == "__main__":
    main()
