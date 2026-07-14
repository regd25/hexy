"""
Núcleo genérico del extractor: construye el grafo de módulos/imports de CUALQUIER repo.

No sabe de frameworks — solo de archivos, carpetas e imports (vía languages.py). Emite el shape
intercambio que `project()` ya consume: carpetas → `area`, archivos → `concept`, jerarquía →
`contains`, imports → `depends_on`. Tipos neutrales a propósito: la Fase C (LLM) los re-tipa a
process/actor/policy según interpretación. Los ids son estables entre corridas (idempotencia).
"""

from __future__ import annotations

import os
import posixpath
import re
import unicodedata

from .languages import LANGUAGES, language_of


def read_text(path):
    """Lee un archivo de texto tolerando encoding; '' si no se puede leer."""
    try:
        with open(path, encoding="utf-8", errors="ignore") as fh:
            return fh.read()
    except OSError:
        return ""

DEFAULT_EXCLUDE_DIRS = {
    "node_modules", ".next", ".git", "dist", "build", "__pycache__", ".venv", "venv",
    "coverage", ".claude", "backups", ".turbo", ".cache", ".idea", ".vscode", "out", ".pytest_cache",
}
DEFAULT_MAX_FILES = 4000


class Graph:
    """Acumulador con dedup por id de artefacto y por (source, target, type) de relación."""

    def __init__(self):
        self.artifacts = {}
        self.rels = {}

    def add_artifact(self, aid, atype, name, description=""):
        if aid not in self.artifacts:
            self.artifacts[aid] = {"id": aid, "type": atype, "name": name, "description": description}
        return aid

    def add_rel(self, source, target, rtype):
        if source == target or source is None or target is None:
            return
        self.rels[(source, target, rtype)] = {"sourceId": source, "targetId": target, "type": rtype}

    def merge(self, other):
        """Funde otro grafo {artifacts, relationships} (p.ej. de un adaptador)."""
        for a in other.get("artifacts", []):
            self.artifacts.setdefault(a["id"], a)
        for r in other.get("relationships", []):
            self.add_rel(r["sourceId"], r["targetId"], r["type"])

    def result(self):
        return {"artifacts": list(self.artifacts.values()), "relationships": list(self.rels.values())}


def sol_name(raw):
    """
    Nombre canónico SOL (`^[A-Z][a-zA-Z0-9]*$`) desde un nombre crudo de código.
    Port determinista de `idFromName` (server/src/domain/sol/serializeYaml.js):
    sale_items → SaleItems · [id] → Id · foo.service → FooService.
    """
    ascii_ = unicodedata.normalize("NFD", raw or "")
    ascii_ = "".join(c for c in ascii_ if unicodedata.category(c) != "Mn")
    parts = [p for p in re.split(r"[^a-zA-Z0-9]+", ascii_) if p]
    pascal = "".join(p[0].upper() + p[1:] for p in parts)
    if not pascal:
        return "Unnamed"
    return pascal if pascal[0].isalpha() else "A" + pascal


def _is_venv(path):
    """Detecta un virtualenv por su marcador estándar (cubre nombres no convencionales, p.ej. temp_env)."""
    return os.path.isfile(os.path.join(path, "pyvenv.cfg"))


def walk_files(root, languages, exclude_dirs, max_files):
    """Recorre el repo y devuelve [(relpath_posix, lang)] de los archivos de código reconocidos."""
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(
            d
            for d in dirnames
            if d not in exclude_dirs and not d.startswith(".") and not _is_venv(os.path.join(dirpath, d))
        )
        for fn in sorted(filenames):
            lang = language_of(fn, languages)
            if not lang:
                continue
            rel = os.path.relpath(os.path.join(dirpath, fn), root).replace(os.sep, "/")
            files.append((rel, lang))
            if len(files) >= max_files:
                return files
    return files


def _detect_alias(root):
    """Alias `@/` trivial de Next/TS: si existe tsconfig con `@/*`, mapea al baseUrl. Best-effort."""
    for name in ("tsconfig.json", "jsconfig.json"):
        p = os.path.join(root, name)
        if os.path.isfile(p):
            if '"@/*"' in read_text(p):
                # baseUrl suele ser "." — mapear "@/x" → "x" desde la raíz cubre el caso común.
                return {"prefix": "@/", "base": ""}
    return None


def _ancestors(rel_dir):
    """Cadena de carpetas ancestro (incluida la raíz '.') de una carpeta rel, de raíz a hoja."""
    chain = ["."]
    if rel_dir and rel_dir != ".":
        acc = ""
        for part in rel_dir.split("/"):
            acc = part if not acc else acc + "/" + part
            chain.append(acc)
    return chain


def _dir_id(rel_dir):
    return "dir:" + (rel_dir or ".")


def _ensure_dir_chain(g, rel_dir, root_name):
    """Crea los nodos `area` de la carpeta y sus ancestros + los `contains` padre→hijo."""
    chain = _ancestors(rel_dir)
    g.add_artifact(_dir_id("."), "area", sol_name(root_name), ".")
    for i in range(1, len(chain)):
        cur = chain[i]
        g.add_artifact(_dir_id(cur), "area", sol_name(posixpath.basename(cur)), cur)
        g.add_rel(_dir_id(chain[i - 1]), _dir_id(cur), "contains")


def build_module_graph(root, files, granularity, max_depth=None):
    """
    Construye el grafo de módulos.
      granularity="file":   un `concept` por archivo, `depends_on` archivo→archivo.
      granularity="folder": nodos `area` por carpeta, `depends_on` carpeta→carpeta (imports
                            intra-carpeta se ignoran) — grafo de arquitectura limpio para repos grandes.
      max_depth (solo folder): carpetas más profundas que N niveles se AGREGAN a su ancestro de
                            nivel N — "vista por áreas" analizable de un repo grande sin perder
                            las aristas (se re-anclan al ancestro).
    """
    g = Graph()
    root_name = posixpath.basename(os.path.abspath(root)) or "repo"
    fileset = {rel for rel, _ in files}
    alias = _detect_alias(root)

    def mod_id(rel):
        return "mod:" + rel

    def clamp_dir(rel_dir):
        """Recorta una carpeta a max_depth niveles ('.' = nivel 0)."""
        if not max_depth or not rel_dir or rel_dir == ".":
            return rel_dir or "."
        parts = rel_dir.split("/")
        return "/".join(parts[:max_depth]) if len(parts) > max_depth else rel_dir

    # Nodos: siempre la jerarquía de carpetas; en modo file además un concept por archivo.
    for rel, _lang in files:
        rel_dir = clamp_dir(posixpath.dirname(rel))
        _ensure_dir_chain(g, rel_dir, root_name)
        if granularity == "file":
            stem = posixpath.basename(rel).rsplit(".", 1)[0]  # sin extensión: canvas.js → Canvas
            g.add_artifact(mod_id(rel), "concept", sol_name(stem), rel)
            g.add_rel(_dir_id(rel_dir or "."), mod_id(rel), "contains")

    # Aristas de import.
    for rel, lang in files:
        spec = LANGUAGES[lang]
        text = read_text(os.path.join(root, rel))
        for specifier in spec["specifiers"](text):
            target = spec["resolve"](specifier, rel, fileset, alias)
            if not target:
                continue
            if granularity == "file":
                g.add_rel(mod_id(rel), mod_id(target), "depends_on")
            else:
                src_dir = clamp_dir(posixpath.dirname(rel) or ".")
                tgt_dir = clamp_dir(posixpath.dirname(target) or ".")
                g.add_rel(_dir_id(src_dir), _dir_id(tgt_dir), "depends_on")

    return g, {"root_name": root_name, "fileset": fileset, "alias": alias, "clamp_dir": clamp_dir}
