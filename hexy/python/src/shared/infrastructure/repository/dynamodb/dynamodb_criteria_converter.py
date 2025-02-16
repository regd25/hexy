from typing import Dict, Any
from src.shared.domain.criteria import Criteria, FilterOperator
from src.shared.domain.repository import RepositoryCriteriaConverter


class DynamoDBCriteriaConverter(RepositoryCriteriaConverter):
    """
    Converts a Criteria object to a filter and parameters understandable by DynamoDB operations.
    """

    OPERATOR_MAPPING = {
        FilterOperator.equal(): "eq",
        FilterOperator.not_equal(): "ne",
        FilterOperator.greater_than_or_equal(): "gte",
        FilterOperator.less_than_or_equal(): "lte",
        FilterOperator.less_than(): "lt",
        FilterOperator.contains(): "contains",
        FilterOperator.begins_with(): "begins_with",
        FilterOperator.includes(): "in",
        FilterOperator.not_like(): "not_like",
        FilterOperator.not_includes(): "not_in",
    }

    def convert(self, criteria: Criteria) -> Dict[str, Any]:
        """
        Converts the Criteria to a dict with expressions and values for DynamoDB.

        :param criteria: The Criteria object with filters and orderings.
        :return: A dict with expressions for DynamoDB.
        """
        expressions = {}
        expression_values = {}
        expression_names = {}

        # Procesar filtros
        filter_expressions = []
        for index, filter_item in enumerate(criteria.filters.filters):
            field_name = filter_item.field.to_primitive()['field']
            operator = self.OPERATOR_MAPPING[filter_item.to_primitive()['operator']]
            value = filter_item.to_primitive()['value']

            # Usar placeholders para los valores
            placeholder_name = f"#attr{index}"
            placeholder_value = f":val{index}"

            expression_names[placeholder_name] = field_name
            expression_values[placeholder_value] = value

            # Crear la expresión según el operador
            if operator == "eq":
                filter_expressions.append(f"{placeholder_name} = {placeholder_value}")
            elif operator == "ne":
                filter_expressions.append(f"{placeholder_name} <> {placeholder_value}")
            elif operator in {"gt", "gte", "lt", "lte"}:
                filter_expressions.append(
                    f"{placeholder_name} {operator} {placeholder_value}"
                )
            elif operator == "contains":
                filter_expressions.append(
                    f"contains({placeholder_name}, {placeholder_value})"
                )
            elif operator == "begins_with":
                filter_expressions.append(
                    f"begins_with({placeholder_name}, {placeholder_value})"
                )
            elif operator == "in":
                placeholder_list = ", ".join(
                    f":val{index}_{i}" for i, _ in enumerate(value)
                )
                for i, v in enumerate(value):
                    expression_values[f":val{index}_{i}"] = v
                filter_expressions.append(f"{placeholder_name} IN ({placeholder_list})")

        # Unir todas las expresiones de filtro
        expressions["FilterExpression"] = " AND ".join(filter_expressions)

        # Ordenamientos
        if criteria.order:
            # El KeyConditionExpression suele usar solo claves primarias,
            # no es común ordenar en DynamoDB en los resultados directamente.
            pass

        # Agregar expresiones de atributos y valores
        expressions["ExpressionAttributeNames"] = expression_names
        expressions["ExpressionAttributeValues"] = expression_values

        return expressions
