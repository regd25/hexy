"""Registro de adaptadores de dominio. Añadir uno nuevo (prisma, django, openapi…) es agregar una
clase a ADAPTERS — el núcleo genérico no se toca."""

from __future__ import annotations

from .adapters.drizzle import DrizzleAdapter

ADAPTERS = [DrizzleAdapter()]


def select_adapters(root, ctx, mode="auto"):
    """
    mode: "auto" → los que detecten su señal; "off" → ninguno; lista de nombres → esos.
    """
    if mode == "off":
        return []
    if isinstance(mode, (list, tuple, set)):
        wanted = set(mode)
        return [a for a in ADAPTERS if a.name in wanted]
    return [a for a in ADAPTERS if a.detect(root, ctx)]
