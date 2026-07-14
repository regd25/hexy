"""
Reglas de import por lenguaje (regex, stdlib puro) para el núcleo genérico del extractor.

Cada lenguaje aporta: qué extensiones reconoce, cómo sacar los specifiers de import del texto,
y cómo resolver un specifier a un archivo interno del repo (o None si es externo/no resoluble).
El núcleo (core.py) usa esto sin saber de ningún lenguaje concreto: añadir un lenguaje nuevo es
registrar otra entrada en LANGUAGES.
"""

from __future__ import annotations

import posixpath
import re

JS_EXTS = (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs")
PY_EXTS = (".py",)

# --- JS / TS -----------------------------------------------------------------

# `[^'"]*?` cruza saltos de línea (imports multilínea con desestructuración).
_JS_IMPORT_RES = (
    re.compile(r"""import\s+[^'"]*?from\s*['"]([^'"]+)['"]"""),  # import X from 'm' / import {a,b} from 'm'
    re.compile(r"""export\s+[^'"]*?from\s*['"]([^'"]+)['"]"""),  # export ... from 'm'
    re.compile(r"""(?<![\w$])import\s*['"]([^'"]+)['"]"""),        # import 'm'  (side-effect)
    re.compile(r"""require\(\s*['"]([^'"]+)['"]\s*\)"""),          # require('m')
    re.compile(r"""(?<![\w$.])import\(\s*['"]([^'"]+)['"]\s*\)"""),  # dynamic import('m')
)

_JS_INDEX = ("/index.ts", "/index.tsx", "/index.js", "/index.jsx")
_JS_SUFFIXES = ("", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs") + _JS_INDEX


def _js_specifiers(text):
    out = []
    for rx in _JS_IMPORT_RES:
        out.extend(m.group(1) for m in rx.finditer(text))
    return out


def _js_resolve(spec, importer_rel, fileset, alias):
    """Resuelve un specifier JS/TS a un archivo del repo. Bare/externo (react, npm) → None."""
    if spec.startswith("."):
        base = posixpath.normpath(posixpath.join(posixpath.dirname(importer_rel), spec))
    elif alias and spec.startswith(alias["prefix"]):
        base = posixpath.normpath(posixpath.join(alias["base"], spec[len(alias["prefix"]) :]))
    else:
        return None  # dependencia externa (node_modules) — fuera del grafo interno
    base = base.lstrip("./")
    for suf in _JS_SUFFIXES:
        cand = base + suf
        if cand in fileset:
            return cand
    return None


# --- Python ------------------------------------------------------------------

_PY_FROM_RE = re.compile(r"^[ \t]*from\s+([.\w]+)\s+import\s", re.MULTILINE)
_PY_IMPORT_RE = re.compile(r"^[ \t]*import\s+([.\w]+)", re.MULTILINE)


def _py_specifiers(text):
    return [m.group(1) for m in _PY_FROM_RE.finditer(text)] + [m.group(1) for m in _PY_IMPORT_RE.finditer(text)]


def _py_resolve(spec, importer_rel, fileset, _alias):
    """Resuelve un módulo Python punteado a archivo. Prueba desde la raíz y desde la carpeta del importador."""
    dots = len(spec) - len(spec.lstrip("."))
    rest = spec.lstrip(".")
    parts = rest.split(".") if rest else []

    bases = []
    if dots:  # import relativo: sube (dots-1) niveles desde la carpeta del importador
        up = posixpath.dirname(importer_rel)
        for _ in range(dots - 1):
            up = posixpath.dirname(up)
        bases.append(up)
    else:  # import absoluto: raíz o carpeta del importador (paquetes planos)
        bases.append("")
        bases.append(posixpath.dirname(importer_rel))

    for base in bases:
        p = posixpath.normpath(posixpath.join(base, *parts)) if parts else base
        p = p.lstrip("./")
        for cand in (p + ".py", (p + "/__init__.py").lstrip("/")):
            if cand in fileset:
                return cand
    return None


LANGUAGES = {
    "js_ts": {"exts": JS_EXTS, "specifiers": _js_specifiers, "resolve": _js_resolve},
    "python": {"exts": PY_EXTS, "specifiers": _py_specifiers, "resolve": _py_resolve},
}


def language_of(filename, enabled):
    """Devuelve la clave de lenguaje para un archivo, si su extensión está habilitada."""
    for lang in enabled:
        spec = LANGUAGES.get(lang)
        if spec and filename.endswith(spec["exts"]):
            return lang
    return None
