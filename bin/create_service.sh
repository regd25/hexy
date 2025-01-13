#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes de error y salir
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    if [ "$2" = "fatal" ]; then
        exit 1
    fi
}

# Función para mostrar mensajes informativos
info() {
    echo -e "${BLUE}$1${NC}"
}

# Función para mostrar mensajes de éxito
success() {
    echo -e "${GREEN}$1${NC}"
}

# Función para validar entrada requerida
validate_required() {
    local input=$1
    local field=$2
    if [ -z "$input" ]; then
        error_exit "El campo '$field' es obligatorio" "fatal"
    fi
}

# Función para convertir a PascalCase
to_pascal_case() {
    echo "$1" | perl -pe 's/(^|[_-])([a-z])/\U\2/g'
}

# Función para validar tipo de value object
validate_vo_type() {
    local type=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    local valid_types=(
        "string" 
        "integer" 
        "float" 
        "boolean" 
        "uuid" 
        "email" 
        "phone" 
        "money" 
        "number_id"
        "date"
        "enum"
    )
    
    for valid_type in "${valid_types[@]}"; do
        if [ "$type" = "$valid_type" ]; then
            return 0
        fi
    done
    return 1
}

# Función para mostrar tipos disponibles
show_vo_types() {
    info "Tipos disponibles:"
    echo "  - string    (texto)"
    echo "  - integer   (número entero)"
    echo "  - float     (número decimal)"
    echo "  - boolean   (verdadero/falso)"
    echo "  - uuid      (identificador único)"
    echo "  - email     (correo electrónico)"
    echo "  - phone     (número telefónico)"
    echo "  - money     (valor monetario)"
    echo "  - number_id (identificador numérico)"
    echo "  - date      (fecha y hora)"
    echo "  - enum      (enumeración)"
}

# Bienvenida
info "Hola soy el asistente para crear servicios en Hexy"
echo "------------------------------------------------"

# Solicitar y validar contexto
read -p "Ingresa el nombre del contexto: " CONTEXT
validate_required "$CONTEXT" "contexto"

# Solicitar y validar nombre del servicio
read -p "Ingresa el nombre del servicio: " SERVICE_NAME
validate_required "$SERVICE_NAME" "nombre del servicio"

# Solicitar agregado (usar nombre del servicio como valor predeterminado)
read -p "Ingresa el nombre del agregado [${SERVICE_NAME}]: " AGGREGATE
AGGREGATE=${AGGREGATE:-$SERVICE_NAME}
info "→ Usando '${AGGREGATE}' como agregado principal"

# Solicitar value objects con sus tipos
VALUE_OBJECT_NAMES=()
VALUE_OBJECT_TYPES=()
info "Ingresa los Value Objects y sus tipos (deja el nombre en blanco para terminar):"
show_vo_types

while true; do
    read -p "Nombre del Value Object: " VO
    [ -z "$VO" ] && break
    
    # Limpiar nombre del VO
    VO=$(echo "$VO" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
    if [ -z "$VO" ]; then
        continue
    fi
    
    while true; do
        read -p "Tipo del Value Object (${VO}): " VO_TYPE
        VO_TYPE=$(echo "$VO_TYPE" | tr '[:upper:]' '[:lower:]' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
        if validate_vo_type "$VO_TYPE"; then
            VALUE_OBJECT_NAMES+=("$VO")
            VALUE_OBJECT_TYPES+=("$VO_TYPE")
            info "✓ Value Object agregado: $VO ($VO_TYPE)"
            break
        else
            error_exit "Tipo inválido. Por favor, usa uno de los tipos disponibles."
            show_vo_types
            continue
        fi
    done
done

# Solicitar casos de uso (array)
USE_CASES=()
info "Ingresa los Casos de Uso (deja en blanco para terminar):"
while true; do
    read -p "Caso de Uso: " UC
    [ -z "$UC" ] && break
    
    # Convertir a snake_case manteniendo la frase completa
    UC=$(echo "$UC" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
    if [ -n "$UC" ]; then
        USE_CASES+=("$UC")
        info "✓ Caso de uso agregado: $UC"
    fi
done

# Generar nombre del repositorio si no se proporciona
REPOSITORY=""
read -p "Ingresa el nombre del repositorio [$(to_pascal_case ${AGGREGATE})Repository]: " REPOSITORY
if [ -z "$REPOSITORY" ]; then
    REPOSITORY="$(to_pascal_case ${AGGREGATE})Repository"
    info "→ Usando '${REPOSITORY}' como nombre del repositorio"
fi

# Mostrar resumen
echo -e "\nResumen de la configuración:"
echo "------------------------------------------------"
echo "  Contexto: $CONTEXT"
echo "  Servicio: $SERVICE_NAME"
echo "  Agregado: $AGGREGATE"
echo "  Repositorio: $REPOSITORY"
if [ ${#VALUE_OBJECT_NAMES[@]} -gt 0 ]; then
    echo "  Value Objects:"
    for i in "${!VALUE_OBJECT_NAMES[@]}"; do
        echo "    - ${VALUE_OBJECT_NAMES[$i]} (${VALUE_OBJECT_TYPES[$i]})"
    done
fi
[ ${#USE_CASES[@]} -gt 0 ] && echo "  Casos de Uso: ${USE_CASES[*]}"
echo "------------------------------------------------"

# Solicitar confirmación
read -p "¿Deseas proceder con la creación? (s/n): " CONFIRM
if [[ "$CONFIRM" != "s" ]]; then
    info "Operación cancelada por el usuario"
    exit 0
fi

# Construir comando Python con mejor manejo de argumentos
CMD="python3 bin/create_service.py"
CMD="$CMD --context \"$CONTEXT\""
CMD="$CMD --service-name \"$SERVICE_NAME\""
CMD="$CMD --aggregate \"$AGGREGATE\""
CMD="$CMD --repository \"$REPOSITORY\""

# Mejorar la construcción de value objects
if [ ${#VALUE_OBJECT_NAMES[@]} -gt 0 ]; then
    vo_args=""
    for i in "${!VALUE_OBJECT_NAMES[@]}"; do
        vo_args="$vo_args \"${VALUE_OBJECT_NAMES[$i]}:${VALUE_OBJECT_TYPES[$i]}\""
    done
    CMD="$CMD --value-objects $vo_args"
fi

# Mejorar la construcción de casos de uso
if [ ${#USE_CASES[@]} -gt 0 ]; then
    uc_args=""
    for uc in "${USE_CASES[@]}"; do
        uc_args="$uc_args \"$uc\""
    done
    CMD="$CMD --use-cases $uc_args"
fi

# Ejecutar comando
info "Creando servicio..."
if eval $CMD; then
    success "¡Servicio creado exitosamente!"
else
    error_exit "Error al crear el servicio. Verifica los logs para más detalles."
fi
