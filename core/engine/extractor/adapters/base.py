"""Interfaz de adaptador de dominio. Cada adaptador enriquece el grafo genérico con semántica
específica de un framework (drizzle, prisma, django, openapi…) cuando detecta su señal."""

from __future__ import annotations


class Adapter:
    name = "base"

    def detect(self, root, ctx):
        """True si este adaptador reconoce el proyecto (barato: mira nombres/archivos de ctx)."""
        return False

    def extract(self, root, ctx):
        """Devuelve un grafo parcial {artifacts, relationships} que se funde con el del núcleo.
        `ctx` trae files=[(rel,lang)], fileset, root_name, granularity para enlazar a nodos del núcleo."""
        return {"artifacts": [], "relationships": []}
