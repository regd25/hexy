"""
Adaptador drizzle-orm: extrae el modelo de datos como grafo de dominio.

  `export const X = pgTable('tabla', {...})`            → artefacto `concept` (una entidad de dominio)
  `.references(() => otra.id)` dentro del bloque        → relación `depends_on` (foreign key)

Tolera la forma con anotación de tipo `.references((): any => otra.id, ...)`. Enlaza cada tabla al
`area` (carpeta) que contiene su schema, para que las entidades cuelguen de la estructura del repo.
"""

from __future__ import annotations

import os
import posixpath
import re

from .base import Adapter
from ..core import read_text, sol_name

_TABLE_RE = re.compile(r"export\s+const\s+(\w+)\s*=\s*(?:pg|sqlite|mysql)Table\(\s*['\"]([^'\"]+)['\"]")
# `references(` + arrow func (con o sin `(): any`) + `=> Tabla.col` → captura el const de la tabla destino.
_FK_RE = re.compile(r"references\(\s*\([^=]*=>\s*([A-Za-z_$][\w$]*)\.")


def _table_id(table_name):
    return "drizzle:table:" + table_name


class DrizzleAdapter(Adapter):
    name = "drizzle"

    def _schema_files(self, ctx):
        """Archivos candidatos a contener el schema: JS/TS cuyo path menciona schema/drizzle."""
        out = []
        for rel, lang in ctx.get("files", []):
            if lang != "js_ts":
                continue
            low = rel.lower()
            if "schema" in low or "drizzle" in low:
                out.append(rel)
        return out

    def detect(self, root, ctx):
        return bool(self._schema_files(ctx))

    def extract(self, root, ctx):
        artifacts, relationships = {}, {}
        const_to_table = {}  # const symbol → nombre de tabla (para resolver FKs entre archivos)
        blocks = []  # (const, table_name, cuerpo_del_bloque, dir_del_archivo)

        clamp = ctx.get("clamp_dir") or (lambda d: d or ".")
        for rel in self._schema_files(ctx):
            text = read_text(os.path.join(root, rel))
            rel_dir = clamp(posixpath.dirname(rel) or ".")
            matches = list(_TABLE_RE.finditer(text))
            for i, m in enumerate(matches):
                const, table_name = m.group(1), m.group(2)
                const_to_table[const] = table_name
                end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
                blocks.append((const, table_name, text[m.end():end], rel_dir))
                tid = _table_id(table_name)
                artifacts[tid] = {"id": tid, "type": "concept", "name": sol_name(table_name), "description": f"tabla drizzle «{table_name}» ({const}) — {rel}"}
                # Enlaza la entidad a la carpeta de su schema (nodo `area` del núcleo).
                relationships[("dir:" + rel_dir, tid, "contains")] = {"sourceId": "dir:" + rel_dir, "targetId": tid, "type": "contains"}

        # Foreign keys → depends_on entre entidades.
        for const, table_name, body, _dir in blocks:
            src = _table_id(table_name)
            for fk in _FK_RE.finditer(body):
                target_const = fk.group(1)
                target_table = const_to_table.get(target_const)
                if not target_table:
                    continue  # referencia a algo fuera del schema escaneado
                tgt = _table_id(target_table)
                if src != tgt:
                    relationships[(src, tgt, "depends_on")] = {"sourceId": src, "targetId": tgt, "type": "depends_on"}

        return {"artifacts": list(artifacts.values()), "relationships": list(relationships.values())}
