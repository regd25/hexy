"""
Extractor de código: proyecta un repo real a un grafo de artefactos Hexy (shape intercambio que
`project()` consume). Núcleo genérico (cualquier repo, JS/TS + Python) + adaptadores de dominio
enchufables. La Fase C (LLM) luego re-tipa los `concept`/`area` a la ontología organizacional.
"""

from __future__ import annotations

from .core import walk_files, build_module_graph, DEFAULT_EXCLUDE_DIRS, DEFAULT_MAX_FILES
from .registry import select_adapters

DEFAULT_LANGUAGES = ["js_ts", "python"]
DEFAULT_GRANULARITY = "folder"


def extract_repo(root, options=None):
    """
    Entrada: root (carpeta del repo) + options. Salida: {artifacts, relationships, stats}.
    options: languages, granularity ("folder"|"file"), adapters ("auto"|"off"|[names]),
             exclude (dirs extra), maxFiles.
    """
    opts = options or {}
    languages = opts.get("languages") or DEFAULT_LANGUAGES
    granularity = opts.get("granularity") or DEFAULT_GRANULARITY
    if granularity not in ("folder", "file"):
        raise ValueError(f"granularity inválida: {granularity!r} (usa 'folder' o 'file')")
    exclude = set(DEFAULT_EXCLUDE_DIRS) | set(opts.get("exclude") or [])
    max_files = int(opts.get("maxFiles") or DEFAULT_MAX_FILES)
    adapters_mode = opts.get("adapters", "auto")
    max_depth = int(opts["maxDepth"]) if opts.get("maxDepth") else None  # None = sin límite

    files = walk_files(root, languages, exclude, max_files)
    g, ctx = build_module_graph(root, files, granularity, max_depth)
    ctx["files"] = files
    ctx["granularity"] = granularity

    used = select_adapters(root, ctx, adapters_mode)
    for adapter in used:
        g.merge(adapter.extract(root, ctx))

    graph = g.result()
    by_type = {}
    for a in graph["artifacts"]:
        by_type[a["type"]] = by_type.get(a["type"], 0) + 1
    graph["stats"] = {
        "filesScanned": len(files),
        "nodes": len(graph["artifacts"]),
        "edges": len(graph["relationships"]),
        "byType": by_type,
        "languages": languages,
        "granularity": granularity,
        "maxDepth": max_depth,
        "adapters": [a.name for a in used],
    }
    return graph
