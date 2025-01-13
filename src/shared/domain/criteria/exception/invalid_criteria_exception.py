from dataclasses import dataclass
from typing import Any, List
from src.shared.domain.exception.domain_exception import DomainException


@dataclass
class InvalidCriteriaException(DomainException):
    """Exception raised when criteria validation fails."""

    parameter: str
    value: Any
    message: str
    allowed_values: List[Any] | None = None

    def __post_init__(self) -> None:
        self.code = "INVALID_CRITERIA"
        super().__post_init__()

    def to_dict(self) -> dict[str, Any]:
        base_dict = super().to_dict()
        error_dict = {
            "parameter": self.parameter,
            "value": str(self.value),
        }
        if self.allowed_values is not None:
            error_dict["allowed_values"] = [str(v) for v in self.allowed_values]

        base_dict.update(error_dict)
        return base_dict

    @classmethod
    def create_invalid_field(
        cls, field: str, valid_fields: list[str]
    ) -> "InvalidCriteriaException":
        """Create exception for invalid field in criteria."""
        return cls(
            message=f"Field '{field}' is not valid. Allowed fields are: {', '.join(valid_fields)}",
            parameter="field",
            value=field,
            allowed_values=valid_fields,
        )

    @classmethod
    def create_invalid_order_type(cls, order_type: str) -> "InvalidCriteriaException":
        """Create exception for invalid order type."""
        allowed = ["asc", "desc"]
        return cls(
            message=f"Order type '{order_type}' is not valid. Must be one of: {', '.join(allowed)}",
            parameter="order_type",
            value=order_type,
            allowed_values=allowed,
        )
